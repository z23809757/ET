# fix-tags.ps1
Write-Host "Fixing escaped HTML tags in TypeScript files..." -ForegroundColor Green

# Navigate to src folder
$srcPath = "D:\Pavan\Expenses Tracker\ET\src"

# Get all .tsx files
$files = Get-ChildItem -Path $srcPath -Recurse -Filter *.tsx

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace escaped tags
    $content = $content -replace '<\\/td>', '</tr>'
    $content = $content -replace '<\\/span>', '</span>'
    $content = $content -replace '<\\/th>', '</th>'
    $content = $content -replace '<\\/tr>', '</tr>'
    $content = $content -replace '<\\/thead>', '</thead>'
    $content = $content -replace '<\\/tbody>', '</tbody>'
    $content = $content -replace '<\\/tfoot>', '</tfoot>'
    
    # Save file
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Done! All files fixed." -ForegroundColor Green