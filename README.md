# Kanban
A small Firefox extension to improve the BugHerd Kanban board. Add's a few features such as:
+ Made the BugHerd dashboard responsive down to about 450px.
+ Added the ability to expand the task details panel for easier reading/editing.
+ Enables you to quickly search for a task by id and bring it up in a full screen modal.
+ Quickly share and open tasks straight from the URL using hashes. Example: http://www.bugherd.com/projects/12345#open123 or http://www.bugherd.com/projects/47756/tasks/123#open.
+ Clearer task id's to hopefully mitigate human errors!

#### Expand task details
![Task Expanded](/img/readme/task-expanded.jpg?raw=true "Optional Title")

## Installation
For quick installation, head to releases and download the latest kanban.xpi from the latest release.

There are two ways to install Kanban, hosting the source on your local server or
using the rawgit links.

Installing and hosting the source from your local system requires you to host the repository in a directory
accessible via a http://localhost/ URL. This is so Kanban can pull the required
scripts and inject them into the page.

Using the rawgit links may be slower but it means you always get the latest
updates automatically and all you need to do is install Kanban.xpi to Firefox. Nothing else.

Head over to releases to download the latest version of the extension. Or download the source and install kanban.xpi found under the dist/ directory.

### Notice:
Kanban will automatically access the source code via this url:

https://rawgit.com/HarryPhillips/Kanban/master/

You will have to go into Firefox Add-ons Manager and change the Base Url preference
for Kanban if you wish to use your own hosted source.

Also, if you opt to keep using the rawgit links, you will not be able to access
Kanban's endpoint features such as the log saving function, found on the GUI console.
