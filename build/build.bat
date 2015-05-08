@echo off

echo Building Kanban...
START /WAIT "BUILDING" r.js.cmd -o config/build.js
echo Compilation complete.

echo.

echo Building minified Kanban...
START /WAIT "BUILDING MINIFIED" r.js.cmd -o config/build-minified.js
echo Compilation complete.

echo.

echo Building Firefox Addon archive...
START /WAIT "BUILDING ARCHIVE" 7z.exe a -tzip ../dist/kanban.xpi ../addon/* 
echo Compilation complete.

echo.

echo Project build finished.