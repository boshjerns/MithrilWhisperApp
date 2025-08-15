; Inno Setup Script for mithril whisper Portable
; Builds an unsigned per-user installer wrapping the portable build

#define MyAppName "mithril whisper"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Voice Assistant Team"
#define MyAppExe "mithril whisper Portable.exe"
#define PortableSrcDir "..\\dist\\mithril whisper Portable-win32-x64"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={userappdata}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputBaseFilename=mithril-whisper-Setup
OutputDir=..\dist\installer
Compression=lzma
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=lowest
WizardStyle=modern
UninstallDisplayIcon={app}\{#MyAppExe}
CloseApplications=yes
CloseApplicationsFilter={#MyAppExe};electron.exe

[Files]
Source: "{#PortableSrcDir}\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Include custom icon (use new logo)
Source: "..\\logo1.ico"; DestDir: "{app}"; Flags: ignoreversion

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; Flags: unchecked

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\\{#MyAppExe}"; IconFilename: "{app}\\logo1.ico"
; Use autodesktop so per-user installs write to the user desktop and admin installs to common desktop
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\\{#MyAppExe}"; Tasks: desktopicon; IconFilename: "{app}\\logo1.ico"

[Run]
Filename: "{app}\\{#MyAppExe}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Code]
procedure KillIfRunning();
var
  ResultCode: Integer;
begin
  try
    Exec('taskkill', '/F /IM '+ '"{#MyAppExe}"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    Exec('taskkill', '/F /IM electron.exe', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  except
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then begin
    KillIfRunning();
  end;
end;

function InitializeUninstall(): Boolean;
begin
  KillIfRunning();
  Result := True;
end;
