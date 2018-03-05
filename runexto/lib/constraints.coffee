constraints =
  name:
    presence: true
    length:
      minimum: 3
      maximum: 15
  surname:
    presence: true
    length:
      minimum: 1
      maximum: 15
  link:
    exists: true
    presence: true
    length:
      minimum: 3
      maximum: 12
    format:
      pattern: "[a-z0-9_]+"
      flags: ""
      message: "can only contain a-z 0-9"
  # interests:
  #   presence: true
  #   length:
  #     minimum: 1
  #     maximum: 15


module.exports = constraints
