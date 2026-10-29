export default (function() {
'use strict'
const hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
const pattern0 = new RegExp("^[0-9]{1,4}\\.[0-9]{1,4}\\.[0-9]{1,4}$", "u");
const stringLength = (string) =>
  /[\uD800-\uDFFF]/.test(string) ? [...string].length : string.length;
const pattern1 = new RegExp("^[a-z0-9-]{1,32}$", "u");
const pattern2 = new RegExp("^[a-z][a-z0-9-]{0,31}$", "u");
const pattern3 = new RegExp("^#[0-9a-fA-F]{6}$", "u");
const pointerPart = (s) => (/~\//.test(s) ? `${s}`.replace(/~/g, '~0').replace(/\//g, '~1') : s);
const pattern4 = new RegExp("^[a-z][a-zA-Z0-9]{0,40}(\\.[a-zA-Z0-9]{1,40}){0,8}$", "u");
const ref0 = function validate(data) {
  validate.errors = null
  let errorCount = 0
  if (!(typeof data === "object" && data && !Array.isArray(data))) {
    if (validate.errors === null) validate.errors = []
    validate.errors.push({ keywordLocation: "#/type", instanceLocation: "#" })
    errorCount++
  }
  else {
    if (!("format" in data && hasOwn(data, "format"))) {
      if (validate.errors === null) validate.errors = []
      validate.errors.push({ keywordLocation: "#/required", instanceLocation: "#/format" })
      errorCount++
    }
    if (!("formatVersion" in data && hasOwn(data, "formatVersion"))) {
      if (validate.errors === null) validate.errors = []
      validate.errors.push({ keywordLocation: "#/required", instanceLocation: "#/formatVersion" })
      errorCount++
    }
    if (!("rulesVersion" in data && hasOwn(data, "rulesVersion"))) {
      if (validate.errors === null) validate.errors = []
      validate.errors.push({ keywordLocation: "#/required", instanceLocation: "#/rulesVersion" })
      errorCount++
    }
    if (!("engineVersion" in data && hasOwn(data, "engineVersion"))) {
      if (validate.errors === null) validate.errors = []
      validate.errors.push({ keywordLocation: "#/required", instanceLocation: "#/engineVersion" })
      errorCount++
    }
    if (!("colours" in data && hasOwn(data, "colours"))) {
      if (validate.errors === null) validate.errors = []
      validate.errors.push({ keywordLocation: "#/required", instanceLocation: "#/colours" })
      errorCount++
    }
    if ("format" in data && hasOwn(data, "format")) {
      if (!(data.format === "colourist-project")) {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/properties/format/const", instanceLocation: "#/format" })
        errorCount++
      }
    }
    if ("formatVersion" in data && hasOwn(data, "formatVersion")) {
      if (!Number.isInteger(data.formatVersion)) {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/properties/formatVersion/type", instanceLocation: "#/formatVersion" })
        errorCount++
      }
      else {
        if (!(1 <= data.formatVersion)) {
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ keywordLocation: "#/properties/formatVersion/minimum", instanceLocation: "#/formatVersion" })
          errorCount++
        }
        if (!(1000 >= data.formatVersion)) {
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ keywordLocation: "#/properties/formatVersion/maximum", instanceLocation: "#/formatVersion" })
          errorCount++
        }
      }
    }
    if ("rulesVersion" in data && hasOwn(data, "rulesVersion")) {
      if (!(typeof data.rulesVersion === "string")) {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/properties/rulesVersion/type", instanceLocation: "#/rulesVersion" })
        errorCount++
      }
      else {
        const prev0 = errorCount
        if (errorCount === prev0) {
          if (!pattern0.test(data.rulesVersion)) {
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ keywordLocation: "#/properties/rulesVersion/pattern", instanceLocation: "#/rulesVersion" })
            errorCount++
          }
        }
      }
    }
    if ("engineVersion" in data && hasOwn(data, "engineVersion")) {
      if (!(typeof data.engineVersion === "string")) {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/properties/engineVersion/type", instanceLocation: "#/engineVersion" })
        errorCount++
      }
      else {
        const prev1 = errorCount
        if (errorCount === prev1) {
          if (!pattern0.test(data.engineVersion)) {
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ keywordLocation: "#/properties/engineVersion/pattern", instanceLocation: "#/engineVersion" })
            errorCount++
          }
        }
      }
    }
    if ("name" in data && hasOwn(data, "name")) {
      if (!(typeof data.name === "string")) {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/properties/name/type", instanceLocation: "#/name" })
        errorCount++
      }
      else {
        if (data.name.length > 120 && stringLength(data.name) > 120) {
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ keywordLocation: "#/properties/name/maxLength", instanceLocation: "#/name" })
          errorCount++
        }
        if (data.name.length < 1 || stringLength(data.name) < 1) {
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ keywordLocation: "#/properties/name/minLength", instanceLocation: "#/name" })
          errorCount++
        }
      }
    }
    if ("target" in data && hasOwn(data, "target")) {
      if (!(data.target === "AA" || data.target === "AAA")) {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/properties/target/enum", instanceLocation: "#/target" })
        errorCount++
      }
    }
    if ("colours" in data && hasOwn(data, "colours")) {
      if (!Array.isArray(data.colours)) {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/properties/colours/type", instanceLocation: "#/colours" })
        errorCount++
      }
      else {
        if (data.colours.length > 64) {
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ keywordLocation: "#/properties/colours/maxItems", instanceLocation: "#/colours" })
          errorCount++
        }
        if (data.colours.length < 1) {
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ keywordLocation: "#/properties/colours/minItems", instanceLocation: "#/colours" })
          errorCount++
        }
        for (let i = 0; i < data.colours.length; i++) {
          if (i in data.colours && hasOwn(data.colours, i)) {
            if (!(typeof data.colours[i] === "object" && data.colours[i] && !Array.isArray(data.colours[i]))) {
              if (validate.errors === null) validate.errors = []
              validate.errors.push({ keywordLocation: "#/properties/colours/items/type", instanceLocation: "#/colours/"+i })
              errorCount++
            }
            else {
              if (!("id" in data.colours[i] && hasOwn(data.colours[i], "id"))) {
                if (validate.errors === null) validate.errors = []
                validate.errors.push({ keywordLocation: "#/properties/colours/items/required", instanceLocation: "#/colours/"+i+"/id" })
                errorCount++
              }
              if (!("name" in data.colours[i] && hasOwn(data.colours[i], "name"))) {
                if (validate.errors === null) validate.errors = []
                validate.errors.push({ keywordLocation: "#/properties/colours/items/required", instanceLocation: "#/colours/"+i+"/name" })
                errorCount++
              }
              if (!("group" in data.colours[i] && hasOwn(data.colours[i], "group"))) {
                if (validate.errors === null) validate.errors = []
                validate.errors.push({ keywordLocation: "#/properties/colours/items/required", instanceLocation: "#/colours/"+i+"/group" })
                errorCount++
              }
              if (!("value" in data.colours[i] && hasOwn(data.colours[i], "value"))) {
                if (validate.errors === null) validate.errors = []
                validate.errors.push({ keywordLocation: "#/properties/colours/items/required", instanceLocation: "#/colours/"+i+"/value" })
                errorCount++
              }
              if ("id" in data.colours[i] && hasOwn(data.colours[i], "id")) {
                if (!(typeof data.colours[i].id === "string")) {
                  if (validate.errors === null) validate.errors = []
                  validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/id/type", instanceLocation: "#/colours/"+i+"/id" })
                  errorCount++
                }
                else {
                  const prev2 = errorCount
                  if (errorCount === prev2) {
                    if (!(pattern1.test(data.colours[i].id))) {
                      if (validate.errors === null) validate.errors = []
                      validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/id/pattern", instanceLocation: "#/colours/"+i+"/id" })
                      errorCount++
                    }
                  }
                }
              }
              if ("name" in data.colours[i] && hasOwn(data.colours[i], "name")) {
                if (!(typeof data.colours[i].name === "string")) {
                  if (validate.errors === null) validate.errors = []
                  validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/name/type", instanceLocation: "#/colours/"+i+"/name" })
                  errorCount++
                }
                else {
                  if (data.colours[i].name.length > 60 && stringLength(data.colours[i].name) > 60) {
                    if (validate.errors === null) validate.errors = []
                    validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/name/maxLength", instanceLocation: "#/colours/"+i+"/name" })
                    errorCount++
                  }
                  if (data.colours[i].name.length < 1 || stringLength(data.colours[i].name) < 1) {
                    if (validate.errors === null) validate.errors = []
                    validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/name/minLength", instanceLocation: "#/colours/"+i+"/name" })
                    errorCount++
                  }
                }
              }
              if ("group" in data.colours[i] && hasOwn(data.colours[i], "group")) {
                if (!(typeof data.colours[i].group === "string")) {
                  if (validate.errors === null) validate.errors = []
                  validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/group/type", instanceLocation: "#/colours/"+i+"/group" })
                  errorCount++
                }
                else {
                  const prev3 = errorCount
                  if (errorCount === prev3) {
                    if (!(pattern2.test(data.colours[i].group))) {
                      if (validate.errors === null) validate.errors = []
                      validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/group/pattern", instanceLocation: "#/colours/"+i+"/group" })
                      errorCount++
                    }
                  }
                }
              }
              if ("value" in data.colours[i] && hasOwn(data.colours[i], "value")) {
                if (!(typeof data.colours[i].value === "string")) {
                  if (validate.errors === null) validate.errors = []
                  validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/value/type", instanceLocation: "#/colours/"+i+"/value" })
                  errorCount++
                }
                else {
                  const prev4 = errorCount
                  if (errorCount === prev4) {
                    if (!(pattern3.test(data.colours[i].value))) {
                      if (validate.errors === null) validate.errors = []
                      validate.errors.push({ keywordLocation: "#/properties/colours/items/properties/value/pattern", instanceLocation: "#/colours/"+i+"/value" })
                      errorCount++
                    }
                  }
                }
              }
              for (const key0 of Object.keys(data.colours[i])) {
                if (key0 !== "id" && key0 !== "name" && key0 !== "group" && key0 !== "value") {
                  if (validate.errors === null) validate.errors = []
                  validate.errors.push({ keywordLocation: "#/properties/colours/items/additionalProperties", instanceLocation: "#/colours/"+i+"/"+pointerPart(key0) })
                  errorCount++
                }
              }
            }
          }
        }
      }
    }
    if ("overrides" in data && hasOwn(data, "overrides")) {
      if (!(typeof data.overrides === "object" && data.overrides && !Array.isArray(data.overrides))) {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/properties/overrides/type", instanceLocation: "#/overrides" })
        errorCount++
      }
      else {
        if (Object.keys(data.overrides).length > 200) {
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ keywordLocation: "#/properties/overrides/maxProperties", instanceLocation: "#/overrides" })
          errorCount++
        }
        for (const key1 of Object.keys(data.overrides)) {
          const prev5 = errorCount
          if (errorCount === prev5) {
            if (!pattern4.test(key1)) {
              if (validate.errors === null) validate.errors = []
              validate.errors.push({ keywordLocation: "#/properties/overrides/propertyNames/pattern", instanceLocation: "#/overrides/"+pointerPart(key1) })
              errorCount++
            }
          }
        }
        for (const key2 of Object.keys(data.overrides)) {
          if (data.overrides[key2] !== undefined) {
            if (!(typeof data.overrides[key2] === "number" || typeof data.overrides[key2] === "string" || typeof data.overrides[key2] === "boolean")) {
              if (validate.errors === null) validate.errors = []
              validate.errors.push({ keywordLocation: "#/properties/overrides/additionalProperties/type", instanceLocation: "#/overrides/"+pointerPart(key2) })
              errorCount++
            }
          }
        }
      }
    }
    for (const key3 of Object.keys(data)) {
      if (key3 !== "format" && key3 !== "formatVersion" && key3 !== "rulesVersion" && key3 !== "engineVersion" && key3 !== "name" && key3 !== "target" && key3 !== "colours" && key3 !== "overrides") {
        if (validate.errors === null) validate.errors = []
        validate.errors.push({ keywordLocation: "#/additionalProperties", instanceLocation: "#/"+pointerPart(key3) })
        errorCount++
      }
    }
  }
  return errorCount === 0
};
return ref0})();;
