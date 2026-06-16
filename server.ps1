# PowerShell Lightweight HTTP Web Server
# Allows Google Sheets to open local links via http://localhost:3003 instead of file:/// blocking.

$currentDir = $PSScriptRoot
if (-not $currentDir) { $currentDir = Get-Location }

# Set console title
$host.UI.RawUI.WindowTitle = "Loft & Craft Web Server (Port 3003)"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "      Loft & Craft Local Web Server (Port 3003)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Server directory: $currentDir" -ForegroundColor Gray
Write-Host "Access Link: http://localhost:3003/estimate.html" -ForegroundColor Green
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "Press Ctrl + C to stop the server at any time." -ForegroundColor Yellow
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3003/")

try {
    $listener.Start()
    Write-Host "🚀 Opening http://localhost:3003/estimate.html in your browser..." -ForegroundColor Green
    Start-Process "http://localhost:3003/estimate.html"
} catch {
    Write-Host "⚠️ Warning: Could not start the server on Port 3003." -ForegroundColor Yellow
    Write-Host "It is likely already running in another window." -ForegroundColor Yellow
    Write-Host "Opening http://localhost:3003/estimate.html in your browser anyway..." -ForegroundColor Green
    try {
        Start-Process "http://localhost:3003/estimate.html"
    } catch {}
    Write-Host ""
    Write-Host "Press Enter to close this window" -ForegroundColor Gray
    Read-Host
    exit
}

# Process HTTP requests in a loop
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Resolve request path
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }
        
        # URL decode path to support Thai characters/spaces
        $urlPath = [System.Uri]::UnescapeDataString($urlPath)
        $filePath = Join-Path $currentDir $urlPath
        
        # Check if file exists and serve
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Detect mime type based on extension
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/html; charset=utf-8"
            if ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript; charset=utf-8" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($ext -eq ".gif") { $contentType = "image/gif" }
            elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
            elseif ($ext -eq ".ico") { $contentType = "image/x-icon" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # File not found response
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>The file '$urlPath' could not be found on this server.</p>")
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # Log request errors but keep listening
        Write-Host "Request exception: $($_.Exception.Message)" -ForegroundColor DarkRed
    }
}
