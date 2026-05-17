import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useFinanceStore } from './useFinanceStore';

export function useRealtimeSync() {
  const { state, dispatch } = useFinanceStore();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!state.activeYearId || !state.loaded) return;

    const tableIds = Object.keys(state.rowsByTable);
    if (tableIds.length === 0) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('rows-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rows',
          filter: `table_id=in.(${tableIds.map(id => `"${id}"`).join(',')})`,
        },
        async (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newRow = { id: payload.new.id, ...payload.new.data_json };
            dispatch({ type: 'ADD_ROW', tableId: payload.new.table_id, row: newRow });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({ 
              type: 'UPDATE_ROW', 
              tableId: payload.new.table_id, 
              rowId: payload.new.id, 
              rowData: payload.new.data_json 
            });
          } else if (payload.eventType === 'DELETE') {
            dispatch({ type: 'DELETE_ROW', tableId: payload.old.table_id, rowId: payload.old.id });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [state.activeYearId, state.rowsByTable, state.loaded]);
}