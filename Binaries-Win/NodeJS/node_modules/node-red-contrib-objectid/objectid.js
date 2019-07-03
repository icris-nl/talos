'use strict'

module.exports = function (RED) {
  function ObjectIdNode (config) {
    var ObjectID = require('bson').ObjectID

    RED.nodes.createNode(this, config)

    this.name = config.name
    this.selectedProperty = config.selectedProperty || '_id'

    let node = this

    node.on('input', msg => {
      if (msg.payload === undefined) {
        return
      }

      var propertyValue
      var newValue

      if (Array.isArray(msg.payload)) {
        newValue = msg.payload.forEach(function (entry) {
          try {
            propertyValue = entry[node.selectedProperty] || null
          } catch (e) {
            node.error(e, msg)
          }

          if (propertyValue) {
            newValue = new ObjectID(propertyValue)
          } else {
            newValue = new ObjectID()
          }

          if (propertyValue && entry[node.selectedProperty] !== Object(entry[node.selectedProperty])) {
            entry[node.selectedProperty] = {
              _id: newValue,
              value: propertyValue
            }
          } else {
            entry[node.selectedProperty] = newValue
          }
        })
      } else {
        try {
          propertyValue = msg.payload[node.selectedProperty] || null
        } catch (e) {
          node.error(e, msg)
        }

        if (propertyValue) {
          newValue = new ObjectID(propertyValue)
        } else {
          newValue = new ObjectID()
        }
      }

      if (propertyValue === null) {
        if (msg.payload !== Object(msg.payload)) {
          let payload = msg.payload
          msg.payload = {
            value: payload
          }
        }
      }

      msg.payload[node.selectedProperty] = newValue

      this.send(msg)
    })
  }

  RED.nodes.registerType('objectid', ObjectIdNode)
}
