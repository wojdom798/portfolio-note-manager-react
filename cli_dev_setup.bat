@echo off
cd %~dp0
ConEmuC -GuiMacro Rename 0 "server"

cmd /k "C:\__cmder\vendor\conemu-maximus5\..\init.bat" -new_console
ConEmuC -GuiMacro Rename 0 "webpack"

cmd /k "C:\__cmder\vendor\conemu-maximus5\..\init.bat" -new_console
ConEmuC -GuiMacro Rename 0 "git"