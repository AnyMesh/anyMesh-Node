# Current Version: 0.3.0
## Compatible with Node and Python from 0.3.x up
## NOT Compatible with Node and Python releases before 0.3.0


## New in 0.3.0 7/13/2014
* New communication protocol allows multiple anyMesh instances on the same IP Address, and even multiple instance within the same program!
* Instances can update their subscriptions without having to disconnect.
* Added Unit Tests.  Install 'nodeunit' globally with NPM to run tests.
### Known Issues
* disconnectFrom() callback will sometimes fire when 2 AnyMesh instances do not have a valid connection.
* UpdateInfo Test will fail intermittently when run consecutively after other tests.


## New in 0.2.0
* New demo app, using Blessed library
* added "getConnections()" method to AnyMesh
* converted to lodash library
* anymesh callbacks are now cloning parameters for operation safety.