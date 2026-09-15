[Setup]
AppName=Wieszka Antivirus
AppVersion=1.0
DefaultDirName={autopf}\WieszkaAntivirus
DefaultGroupName=Wieszka Antivirus
UninstallDisplayIcon={app}\WieszkaAntivirus.exe
Compression=lzma2
SolidCompression=yes
OutputDir=.\out\installer
OutputBaseFilename=WieszkaAntivirus_WizardSetup
; Tutaj użytkownik musi zaakceptować licencję przed instalacją
; LicenseFile=C:\sciezka\do\licencji.txt 

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Inno Setup bierze wszystkie spakowane pliki z folderu produkcyjnego Electrona
Source: ".\out\WieszkaAntivirus-win32-x64\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Wieszka Antivirus"; Filename: "{app}\WieszkaAntivirus.exe"
Name: "{autodesktop}\Wieszka Antivirus"; Filename: "{app}\WieszkaAntivirus.exe"; Tasks: desktopicon
