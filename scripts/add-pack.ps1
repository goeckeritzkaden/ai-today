param(
  [Parameter(Mandatory = $true)]
  [string]$File
)

$node = "C:\Users\goeck\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
& $node "$PSScriptRoot\add-pack.js" --file $File
