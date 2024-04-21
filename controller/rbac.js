import Roles from '../database/models/roles.js'
import Permission from '../database/models/permission.js'
import Policy from '../database/models/definitions.js'
import Exception from '../utils/exception.js'

export default class Rbac {
  async createRole(req, res, next) {
    try {
      const { role } = req.body
      if (error) throw new Exception(error.details[0].message, 400)
      const roles = await Roles.find()
      const existingRoles = roles.map((value) => value.role)

      const newRoles = []

      role.forEach((element) => {
        const isExist = existingRoles.includes(element)
        if (!isExist) {
          newRoles.push({ role: element })
        }
      })
      this.result = await Roles.create(newRoles)

      return this.result
    } catch (error) {
      throw new Exception(error.message, error.status)
    }
  }

  async createPermision(req, res, next) {
    try {
      const samplePermission = [
        { action: 'CREATE' },
        { action: 'READ' },
        { action: 'UPDATE' },
        { action: 'DELETE' },
        { action: 'MODIFY' },
        { action: 'MANAGE' },
        { action: 'READOWN' },
        { action: 'UPDATEOWN' },
        { action: 'DELETEOWN' },
      ]
      const { permision } = req.body
      const permisions = await Permission.find()
      const existingPermission = permisions.map((value) => value.action)

      const newPermission = []

      permission.forEach((element) => {
        const isExist = existingPermission.includes(element?.action)
        if (!isExist) {
          newPermission.push(element?.action)
        }
      })
      this.result = await Roles.create(newPermission)

      return this.result
    } catch (error) {
      throw new Exception(error.message, error.status)
    }
  }

  async createPolicy(req, res, next) {
    try {
      const { role, action, resource } = req.body

      const userRole = await Roles.findOne({ role })
      const permision = await Permission.findOne({ action })

      // definition pattern

      // Role -> can/allow  ->  Permission on -> Resource - when -> Condition//Take Action
      // Admin can  delete post when/if(location.status == 'rejected' )
      // Admin can  delete post when/if(location.userId == user.id )

      const condition = {
        // when
        fn: 'equal',
        target: {
          // the resource
          key: 'location',
          filter: 'userId',
        },
        evaluator: {
          // matcher
          key: 'user',
          filter: 'id',
        },
      }

      const data = {
        role: userRole._id, // admin can
        permission: permision._id, // delete
        resource, // location
        attributes: [],
        condition,
      }

      this.policy = await Policy.create(data)

      return this.policy
    } catch (error) {
      throw new Exception(error.message, error.status)
    }
  }

  // Condition
  //   -> own
  //   -> anyOf
  //   -> oneOf
  //   -> allOf
  //   -> atLeast
  //   -> and
  //   -> or
  //   -> equal
  //   -> notEqual

  // function to check for permission
  async can(user, action, resource, when = ('equals', params)) {
    // fetch the user from datastore or use the user's role to check policy definition
    Policy.findOne()
    this.policy = await Policy.findOne({
      role: user.role,
      permission: action,
      resource,
    })
    if (!this.policy) {
      return { allow: false }
    }
    // resource.id == params.id
    return { allow: false }
  }
}

const a = new Rbac()
a.can(req.user, 'create', 'post', { postId: 2, userId: 4 }).then(
  (perm) => perm.allow
)
