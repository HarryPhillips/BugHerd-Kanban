# Kanban
A small Firefox extension to improve the BugHerd Kanban board. Add's a few features such as:
+ Made the BugHerd dashboard responsive down to about 450px.
+ Added the ability to expand the task details panel for easier reading/editing.
+ Enables you to quickly search for a task by id and bring it up in a full screen modal.
+ Flexible task filtering
+ Settings to make Kanban work best for you
+ Screenshot/Image viewer to make viewing image attachments easier
+ Console to monitor various BugHerd activities
+ (subjectively) better styling

##### Expand the task details panel
You can expand a task to fill up the screen, making it a bit easier to read tasks
with large descriptions and large collections of metadata.
![Task Expanded](/img/readme/task-expanded.png?raw=true "Expanded Task")

##### Responsive dashboard
The Kanban Board is now somewhat responsive, you can now use BugHerd with a smaller
window.
![Responsive Kanban](/img/readme/responsive-dashboard.png?raw=true "Responsive")

##### Debug Console & Status Logs
In the upper right-hand corner is a small menu with a console attached, here you
will find Kanban Settings and the debug console. The console will output miscellaneous
events which occur as you use BugHerd. The console will even log when tasks are
moved, updated and deleted.
![GUI Console](/img/readme/gui-console.png?raw=true "GUI Console")

##### Quick & Simple Task Search
You can quickly and easily search the entire project for a task by ID.
![Task Search](/img/readme/task-search.png?raw=true "Task Search")

##### Flexible Task Filtering
Using this menu you can filter tasks by data such as the user who raised the bug,
the operating system used, the resolution and other meta data.
![Task Filters](/img/readme/task-filters.png?raw=true "Task Filters")

##### Styling Changes
The extension loads in some additional CSS files which (subjectively) make BugHerd
look a little better. Most notably the tasks are coloured depending on their
severity, making them stand out.
![Styling](/img/readme/severity-styles.png?raw=true "Styling")

## Installation
For quick installation, head to releases and download the kanban.xpi from the latest release.

There are two ways to install Kanban, hosting the source on your local server or
using the rawgit links.

Installing and hosting the source from your local system requires you to host the repository in a directory
accessible via a http://localhost/ URL. This is so Kanban can pull the required
scripts and inject them into the page.

Using the rawgit links may be slower but it means you always get the latest
updates automatically and all you need to do is install Kanban.xpi to Firefox. Nothing else.

Head over to releases to download the latest version of the extension. Or download the source and install kanban.xpi found under the dist/ directory.

### Notice:
Kanban will automatically access the source code via https://rawgit.com

You will have to go into Firefox Add-ons Manager and change the Base Url preference
for Kanban if you wish to use your own hosted source.

Also, if you opt to keep using the rawgit links, you will not be able to access
Kanban's endpoint features such as the log saving function, found on the GUI console.
