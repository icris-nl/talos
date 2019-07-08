:::::::::::::::::::::::::::::::::::::::::
:: Automatically check & get admin rights
:::::::::::::::::::::::::::::::::::::::::
@echo off
CLS
ECHO.
ECHO =============================
ECHO Running Admin shell
ECHO =============================
:init
setlocal DisableDelayedExpansion
set "batchPath=%~0"
for %%k in (%0) do set batchName=%%~nk
set "vbsGetPrivileges=%temp%\OEgetPriv_%batchName%.vbs"
setlocal EnableDelayedExpansion

:checkPrivileges
NET FILE 1>NUL 2>NUL
if '%errorlevel%' == '0' ( goto gotPrivileges ) else ( goto getPrivileges )

:getPrivileges
if '%1'=='ELEV' (echo ELEV & shift /1 & goto gotPrivileges)
ECHO.
ECHO **************************************
ECHO Invoking UAC for Privilege Escalation
ECHO **************************************

ECHO Set UAC = CreateObject^("Shell.Application"^) > "%vbsGetPrivileges%"
ECHO args = "ELEV " >> "%vbsGetPrivileges%"
ECHO For Each strArg in WScript.Arguments >> "%vbsGetPrivileges%"
ECHO args = args ^& strArg ^& " "  >> "%vbsGetPrivileges%"
ECHO Next >> "%vbsGetPrivileges%"
ECHO UAC.ShellExecute "!batchPath!", args, "", "runas", 1 >> "%vbsGetPrivileges%"
"%SystemRoot%\System32\WScript.exe" "%vbsGetPrivileges%" %*
exit /B

:gotPrivileges
setlocal & pushd .
cd /d %~dp0
if '%1'=='ELEV' (del "%vbsGetPrivileges%" 1>nul 2>nul  &  shift /1)

::::::::::::::::::::::::::::
::START
::::::::::::::::::::::::::::

echo Creating required folders
md c:\Talos
md c:\Talos\Temp
md c:\Talos\Node-RED
md c:\Talos\Out
md c:\Talos\InfluxDB
md c:\Talos\Chronograf
md c:\Talos\Grafana
md c:\Talos\MongoDB
md c:\Talos\MongoDB\Data
md c:\Talos\WWWRoot
md c:\Talos\NodeJS
md c:\Talos\7-Zip

xcopy /y Node-RED\settings.js c:\Talos\node-red
xcopy /y Node-RED\flows.json c:\Talos\node-red
xcopy /y Node-RED\flows_cred.json c:\Talos\node-red
xcopy /y Node-RED\restartservice.bat c:\Talos\node-red

echo Copying Wwwroot files...
xcopy /sy wwwroot\*.* c:\Talos\wwwroot

echo Copying nodejs files...
xcopy /sy binaries-win\NodeJS\*.* c:\Talos\nodejs

echo Copying 7-zip files...
xcopy /sy binaries-win\7-zip\*.* c:\Talos\7-zip

echo Copying MongoDB...
xcopy /sy binaries-win\mongodb\*.* c:\Talos\mongodb

echo Copying InfluxDB...
xcopy /sy binaries-win\influxdb\*.* c:\Talos\influxdb

echo Copying Chronograf...
xcopy /sy binaries-win\chronograf\*.* c:\Talos\chronograf

echo Copying Grafana...
xcopy /sy binaries-win\grafana\*.* c:\Talos\Grafana

echo Installing MongoDB as a service...
binaries-win\nssm stop MongoDB
binaries-win\nssm remove MongoDB confirm
binaries-win\nssm install MongoDB "c:\Talos\mongodb\mongod.exe"
binaries-win\nssm set MongoDB AppDirectory "c:\Talos\mongodb"
binaries-win\nssm set MongoDB AppParameters "--dbpath=c:\Talos\mongodb\data"
binaries-win\nssm set MongoDB Description "Talos - MongoDB service"

echo Starting mongodb service...
net start MongoDB

echo Installing Influxdb as a service...
binaries-win\nssm stop InfluxDB
binaries-win\nssm remove InfluxDB confirm
binaries-win\nssm install InfluxDB "c:\Talos\influxdb\influxd.exe"
binaries-win\nssm set InfluxDB AppDirectory "c:\Talos\influxdb"
binaries-win\nssm set InfluxDB AppParameters "-config influxdb.conf"
binaries-win\nssm set InfluxDB Description "Talos - InfluxDB service"

echo Starting influxdb service...
net start InfluxDB

echo Installing Chronograf as a service...
binaries-win\nssm stop Chronograf
binaries-win\nssm remove Chronograf confirm
binaries-win\nssm install Chronograf "c:\Talos\chronograf\chronograf.exe"
binaries-win\nssm set Chronograf AppDirectory "c:\Talos\chronograf"
binaries-win\nssm set Chronograf Description "Talos - Chronograf service"

echo Starting chronograf service...
net start Chronograf

echo Installing Grafana as a service...
binaries-win\nssm stop Grafana
binaries-win\nssm remove Grafana confirm
binaries-win\nssm install Grafana "c:\Talos\grafana\bin\grafana-server.exe"
binaries-win\nssm set Grafana AppDirectory "c:\Talos\grafana\bin"
binaries-win\nssm set Grafana Description "Talos - Grafana service"

echo Starting Grafana service...
net start Grafana

echo Installing Node-Red as a Service...
binaries-win\nssm stop Node-RED
binaries-win\nssm remove Node-RED confirm
binaries-win\nssm install Node-RED "c:\Talos\nodejs\node-red.cmd"
binaries-win\nssm set Node-RED AppDirectory "c:\Talos\node-red"
binaries-win\nssm set Node-RED AppParameters "-u c:\Talos\node-red > c:\Talos\temp\node-red.log"
binaries-win\nssm set Node-RED Description "Talos - Node-red application service"

echo Starting node-red service...
net start Node-RED

echo Finished installation. Please go to http://localhost:1880/ to start using the Talos stack.

pause