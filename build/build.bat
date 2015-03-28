@echo off

echo Building Kanban...
START /WAIT "BUILDING" r.js.cmd -o config/build.js
echo Compilation complete.

echo.

echo Building minified Kanban...
START /WAIT "BUILDING_MIN" r.js.cmd -o config/build-minified.js
echo Compilation complete.

echo.

echo Project build finished.