# ============================================
# BlueprintX 自动推送脚本
# 使用方法: 直接双击运行 或 在终端执行 .\autopush.ps1
# ============================================

$GIT = "C:\Program Files\Git\cmd\git.exe"
$REPO_DIR = $PSScriptRoot

Set-Location $REPO_DIR

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  BlueprintX GitHub 自动同步工具" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检测本地变更
$status = & $GIT status --porcelain
if (-not $status) {
    Write-Host "✅ 没有检测到任何变更，本地已和 GitHub 同步！" -ForegroundColor Green
    Write-Host ""
    Read-Host "按 Enter 退出"
    exit 0
}

# 显示变更文件列表
Write-Host "📝 检测到以下文件变更：" -ForegroundColor Yellow
& $GIT status --short
Write-Host ""

# 询问是否继续推送
$confirm = Read-Host "是否将以上变更推送到 GitHub？(y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ 已取消推送。" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 0
}

# 询问 commit message，默认使用时间戳
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$defaultMsg = "Update: $timestamp"
Write-Host ""
$commitMsg = Read-Host "输入提交备注（直接回车使用默认：'$defaultMsg'）"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = $defaultMsg
}

Write-Host ""
Write-Host "⬆️  正在推送到 GitHub..." -ForegroundColor Cyan

# 执行 add / commit / push
& $GIT add -A
& $GIT commit -m $commitMsg
& $GIT push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 推送成功！Vercel 将自动开始重新部署。" -ForegroundColor Green
    Write-Host "🔗 查看部署状态: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ 推送失败，请检查网络连接或 GitHub 权限。" -ForegroundColor Red
}

Write-Host ""
Read-Host "按 Enter 退出"
