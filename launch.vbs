Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Salad\Desktop\Misc\Projects\cue-main\cue-main"
WshShell.Run "cmd /c node start.js", 0, False
Set WshShell = Nothing