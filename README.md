# Astra Schedule Outlook Add-in

## Description
This application serves as the user interface for the Astra Schedule Outlook add-in. The add-in displays a list of available rooms in Astra Schedule and allows users to create events in those rooms while booking meetings in Outlook. Note that these events are not tied to the Outlook meeting lifecycle, so rescheduling or canceling a previously booked meeting will not affect the event. This add-in also does not enable any bi-directional calendar syncing, so events created in Schedule do not block the room's calendar in Outlook (if applicable). 

The application communicates with Astra Schedule via the Astra Bridge API, which is developed and deployed separately from this project. Please reach out to your contact at Ad Astra for any details you may need about this API.

## Contributing
We welcome and appreciate any contributions of new capabilities or user interface enhancements that fit within the strategic vision of the add-in. Pull requests will be reviewed by Ad Astra product engineering to ensure standards are kept and that the enhancements/capabilities fit within the vision of the product, but if there are questions on standards/vision please log an Issue to this repository for clarification first.

### Development
This project is written using React and TypeScript and follows common coding standards for those technologies. Automated testing uses Jest, and continuous integration/deployment for the master branch runs in the Ad Astra production stack.

More information is available here:
* [Office add-in documentation](https://docs.microsoft.com/office/dev/add-ins/overview/office-add-ins)
* More Office Add-in examples at [OfficeDev on Github](https://github.com/officedev)

### Testing/Debugging

Office add-ins can be sideloaded to a single user's Outlook instance for testing. Details on that are available here:
* [Sideload Outlook add-ins for testing](https://docs.microsoft.com/en-us/outlook/add-ins/sideload-outlook-add-ins-for-testing)

For running and manually testing the application locally, you can run `npm run start:localhost` and debug using the following methods:
- [Use a browser's developer tools](https://docs.microsoft.com/office/dev/add-ins/testing/debug-add-ins-in-office-online)
- [Attach a debugger from the task pane](https://docs.microsoft.com/office/dev/add-ins/testing/attach-debugger-from-task-pane)
- [Use F12 developer tools on Windows 10](https://docs.microsoft.com/office/dev/add-ins/testing/debug-add-ins-using-f12-developer-tools-on-windows-10)
