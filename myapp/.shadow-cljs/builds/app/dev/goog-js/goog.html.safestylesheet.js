["^ ","~:resource-id",["~:shadow.build.classpath/resource","goog/html/safestylesheet.js"],"~:js","goog.loadModule(function(exports) {\n  \"use strict\";\n  goog.module(\"goog.html.SafeStyleSheet\");\n  goog.module.declareLegacyNamespace();\n  const Const = goog.require(\"goog.string.Const\");\n  const SafeStyle = goog.require(\"goog.html.SafeStyle\");\n  const TypedString = goog.require(\"goog.string.TypedString\");\n  const googObject = goog.require(\"goog.object\");\n  const {assert, fail} = goog.require(\"goog.asserts\");\n  const {contains} = goog.require(\"goog.string.internal\");\n  const CONSTRUCTOR_TOKEN_PRIVATE = {};\n  class SafeStyleSheet {\n    constructor(value, token) {\n      this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = token === CONSTRUCTOR_TOKEN_PRIVATE ? value : \"\";\n      this.implementsGoogStringTypedString = true;\n    }\n    toString() {\n      return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_.toString();\n    }\n    static createRule(selector, style) {\n      if (contains(selector, \"\\x3c\")) {\n        throw new Error(`Selector does not allow '<', got: ${selector}`);\n      }\n      const selectorToCheck = selector.replace(/('|\")((?!\\1)[^\\r\\n\\f\\\\]|\\\\[\\s\\S])*\\1/g, \"\");\n      if (!/^[-_a-zA-Z0-9#.:* ,>+~[\\]()=^$|]+$/.test(selectorToCheck)) {\n        throw new Error(\"Selector allows only [-_a-zA-Z0-9#.:* ,\\x3e+~[\\\\]()\\x3d^$|] and \" + \"strings, got: \" + selector);\n      }\n      if (!SafeStyleSheet.hasBalancedBrackets_(selectorToCheck)) {\n        throw new Error(\"() and [] in selector must be balanced, got: \" + selector);\n      }\n      if (!(style instanceof SafeStyle)) {\n        style = SafeStyle.create(style);\n      }\n      const styleSheet = `${selector}{` + SafeStyle.unwrap(style).replace(/</g, \"\\\\3C \") + \"}\";\n      return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet);\n    }\n    static hasBalancedBrackets_(s) {\n      const brackets = {\"(\":\")\", \"[\":\"]\"};\n      const expectedBrackets = [];\n      for (let i = 0; i < s.length; i++) {\n        const ch = s[i];\n        if (brackets[ch]) {\n          expectedBrackets.push(brackets[ch]);\n        } else if (googObject.contains(brackets, ch)) {\n          if (expectedBrackets.pop() != ch) {\n            return false;\n          }\n        }\n      }\n      return expectedBrackets.length == 0;\n    }\n    static concat(var_args) {\n      let result = \"\";\n      const addArgument = argument => {\n        if (Array.isArray(argument)) {\n          argument.forEach(addArgument);\n        } else {\n          result += SafeStyleSheet.unwrap(argument);\n        }\n      };\n      Array.prototype.forEach.call(arguments, addArgument);\n      return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(result);\n    }\n    static fromConstant(styleSheet) {\n      const styleSheetString = Const.unwrap(styleSheet);\n      if (styleSheetString.length === 0) {\n        return SafeStyleSheet.EMPTY;\n      }\n      assert(!contains(styleSheetString, \"\\x3c\"), `Forbidden '<' character in style sheet string: ${styleSheetString}`);\n      return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheetString);\n    }\n    getTypedStringValue() {\n      return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;\n    }\n    static unwrap(safeStyleSheet) {\n      if (safeStyleSheet instanceof SafeStyleSheet && safeStyleSheet.constructor === SafeStyleSheet) {\n        return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;\n      } else {\n        fail(\"expected object of type SafeStyleSheet, got '\" + safeStyleSheet + \"' of type \" + goog.typeOf(safeStyleSheet));\n        return \"type_error:SafeStyleSheet\";\n      }\n    }\n    static createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet) {\n      return new SafeStyleSheet(styleSheet, CONSTRUCTOR_TOKEN_PRIVATE);\n    }\n  }\n  SafeStyleSheet.EMPTY = SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(\"\");\n  exports = SafeStyleSheet;\n  return exports;\n});\n","~:source","/**\n * @license\n * Copyright The Closure Library Authors.\n * SPDX-License-Identifier: Apache-2.0\n */\n\n/**\n * @fileoverview The SafeStyleSheet type and its builders.\n *\n * TODO(xtof): Link to document stating type contract.\n */\n\ngoog.module('goog.html.SafeStyleSheet');\ngoog.module.declareLegacyNamespace();\n\nconst Const = goog.require('goog.string.Const');\nconst SafeStyle = goog.require('goog.html.SafeStyle');\nconst TypedString = goog.require('goog.string.TypedString');\nconst googObject = goog.require('goog.object');\nconst {assert, fail} = goog.require('goog.asserts');\nconst {contains} = goog.require('goog.string.internal');\n\n/**\n * Token used to ensure that object is created only from this file. No code\n * outside of this file can access this token.\n * @const {!Object}\n */\nconst CONSTRUCTOR_TOKEN_PRIVATE = {};\n\n/**\n * A string-like object which represents a CSS style sheet and that carries the\n * security type contract that its value, as a string, will not cause untrusted\n * script execution (XSS) when evaluated as CSS in a browser.\n *\n * Instances of this type must be created via the factory method\n * `SafeStyleSheet.fromConstant` and not by invoking its constructor. The\n * constructor intentionally takes an extra parameter that cannot be constructed\n * outside of this file and the type is immutable; hence only a default instance\n * corresponding to the empty string can be obtained via constructor invocation.\n *\n * A SafeStyleSheet's string representation can safely be interpolated as the\n * content of a style element within HTML. The SafeStyleSheet string should\n * not be escaped before interpolation.\n *\n * Values of this type must be composable, i.e. for any two values\n * `styleSheet1` and `styleSheet2` of this type,\n * `SafeStyleSheet.unwrap(styleSheet1) + SafeStyleSheet.unwrap(styleSheet2)`\n * must itself be a value that satisfies the SafeStyleSheet type constraint.\n * This requirement implies that for any value `styleSheet` of this type,\n * `SafeStyleSheet.unwrap(styleSheet1)` must end in\n * \"beginning of rule\" context.\n *\n * A SafeStyleSheet can be constructed via security-reviewed unchecked\n * conversions. In this case producers of SafeStyleSheet must ensure themselves\n * that the SafeStyleSheet does not contain unsafe script. Note in particular\n * that `&lt;` is dangerous, even when inside CSS strings, and so should\n * always be forbidden or CSS-escaped in user controlled input. For example, if\n * `&lt;/style&gt;&lt;script&gt;evil&lt;/script&gt;\"` were interpolated\n * inside a CSS string, it would break out of the context of the original\n * style element and `evil` would execute. Also note that within an HTML\n * style (raw text) element, HTML character references, such as\n * `&amp;lt;`, are not allowed. See\n * http://www.w3.org/TR/html5/scripting-1.html#restrictions-for-contents-of-script-elements\n * (similar considerations apply to the style element).\n *\n * @see SafeStyleSheet#fromConstant\n * @final\n * @implements {TypedString}\n */\nclass SafeStyleSheet {\n  /**\n   * @param {string} value\n   * @param {!Object} token package-internal implementation detail.\n   */\n  constructor(value, token) {\n    /**\n     * The contained value of this SafeStyleSheet.  The field has a purposely\n     * ugly name to make (non-compiled) code that attempts to directly access\n     * this field stand out.\n     * @private {string}\n     */\n    this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ =\n        (token === CONSTRUCTOR_TOKEN_PRIVATE) ? value : '';\n\n    /**\n     * @override\n     * @const\n     */\n    this.implementsGoogStringTypedString = true;\n  }\n\n  /**\n   * Returns a string-representation of this value.\n   *\n   * To obtain the actual string value wrapped in a SafeStyleSheet, use\n   * `SafeStyleSheet.unwrap`.\n   *\n   * @return {string}\n   * @see SafeStyleSheet#unwrap\n   * @override\n   */\n  toString() {\n    return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_.toString();\n  }\n\n  /**\n   * Creates a style sheet consisting of one selector and one style definition.\n   * Use {@link SafeStyleSheet.concat} to create longer style sheets.\n   * This function doesn't support @import, @media and similar constructs.\n   * @param {string} selector CSS selector, e.g. '#id' or 'tag .class, #id'. We\n   *     support CSS3 selectors: https://w3.org/TR/css3-selectors/#selectors.\n   * @param {!SafeStyle.PropertyMap|!SafeStyle} style Style\n   *     definition associated with the selector.\n   * @return {!SafeStyleSheet}\n   * @throws {!Error} If invalid selector is provided.\n   */\n  static createRule(selector, style) {\n    if (contains(selector, '<')) {\n      throw new Error(`Selector does not allow '<', got: ${selector}`);\n    }\n\n    // Remove strings.\n    const selectorToCheck =\n        selector.replace(/('|\")((?!\\1)[^\\r\\n\\f\\\\]|\\\\[\\s\\S])*\\1/g, '');\n\n    // Check characters allowed in CSS3 selectors.\n    if (!/^[-_a-zA-Z0-9#.:* ,>+~[\\]()=^$|]+$/.test(selectorToCheck)) {\n      throw new Error(\n          'Selector allows only [-_a-zA-Z0-9#.:* ,>+~[\\\\]()=^$|] and ' +\n          'strings, got: ' + selector);\n    }\n\n    // Check balanced () and [].\n    if (!SafeStyleSheet.hasBalancedBrackets_(selectorToCheck)) {\n      throw new Error(\n          '() and [] in selector must be balanced, got: ' + selector);\n    }\n\n    if (!(style instanceof SafeStyle)) {\n      style = SafeStyle.create(style);\n    }\n    const styleSheet =\n        `${selector}{` + SafeStyle.unwrap(style).replace(/</g, '\\\\3C ') + '}';\n    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(\n        styleSheet);\n  }\n\n  /**\n   * Checks if a string has balanced () and [] brackets.\n   * @param {string} s String to check.\n   * @return {boolean}\n   * @private\n   */\n  static hasBalancedBrackets_(s) {\n    const brackets = {'(': ')', '[': ']'};\n    const expectedBrackets = [];\n    for (let i = 0; i < s.length; i++) {\n      const ch = s[i];\n      if (brackets[ch]) {\n        expectedBrackets.push(brackets[ch]);\n      } else if (googObject.contains(brackets, ch)) {\n        if (expectedBrackets.pop() != ch) {\n          return false;\n        }\n      }\n    }\n    return expectedBrackets.length == 0;\n  }\n\n  /**\n   * Creates a new SafeStyleSheet object by concatenating values.\n   * @param {...(!SafeStyleSheet|!Array<!SafeStyleSheet>)}\n   *     var_args Values to concatenate.\n   * @return {!SafeStyleSheet}\n   */\n  static concat(var_args) {\n    let result = '';\n\n    /**\n     * @param {!SafeStyleSheet|!Array<!SafeStyleSheet>}\n     *     argument\n     */\n    const addArgument = argument => {\n      if (Array.isArray(argument)) {\n        argument.forEach(addArgument);\n      } else {\n        result += SafeStyleSheet.unwrap(argument);\n      }\n    };\n\n    Array.prototype.forEach.call(arguments, addArgument);\n    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(\n        result);\n  }\n\n  /**\n   * Creates a SafeStyleSheet object from a compile-time constant string.\n   *\n   * `styleSheet` must not have any &lt; characters in it, so that\n   * the syntactic structure of the surrounding HTML is not affected.\n   *\n   * @param {!Const} styleSheet A compile-time-constant string from\n   *     which to create a SafeStyleSheet.\n   * @return {!SafeStyleSheet} A SafeStyleSheet object initialized to\n   *     `styleSheet`.\n   */\n  static fromConstant(styleSheet) {\n    const styleSheetString = Const.unwrap(styleSheet);\n    if (styleSheetString.length === 0) {\n      return SafeStyleSheet.EMPTY;\n    }\n    // > is a valid character in CSS selectors and there's no strict need to\n    // block it if we already block <.\n    assert(\n        !contains(styleSheetString, '<'),\n        `Forbidden '<' character in style sheet string: ${styleSheetString}`);\n    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(\n        styleSheetString);\n  }\n\n  /**\n   * Returns this SafeStyleSheet's value as a string.\n   *\n   * IMPORTANT: In code where it is security relevant that an object's type is\n   * indeed `SafeStyleSheet`, use `SafeStyleSheet.unwrap`\n   * instead of this method. If in doubt, assume that it's security relevant. In\n   * particular, note that goog.html functions which return a goog.html type do\n   * not guarantee the returned instance is of the right type. For example:\n   *\n   * <pre>\n   * var fakeSafeHtml = new String('fake');\n   * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;\n   * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);\n   * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by\n   * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml\n   * // instanceof goog.html.SafeHtml.\n   * </pre>\n   *\n   * @see SafeStyleSheet#unwrap\n   * @override\n   */\n  getTypedStringValue() {\n    return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;\n  }\n\n  /**\n   * Performs a runtime check that the provided object is indeed a\n   * SafeStyleSheet object, and returns its value.\n   *\n   * @param {!SafeStyleSheet} safeStyleSheet The object to extract from.\n   * @return {string} The safeStyleSheet object's contained string, unless\n   *     the run-time type check fails. In that case, `unwrap` returns an\n   *     innocuous string, or, if assertions are enabled, throws\n   *     `asserts.AssertionError`.\n   */\n  static unwrap(safeStyleSheet) {\n    // Perform additional Run-time type-checking to ensure that\n    // safeStyleSheet is indeed an instance of the expected type.  This\n    // provides some additional protection against security bugs due to\n    // application code that disables type checks.\n    // Specifically, the following checks are performed:\n    // 1. The object is an instance of the expected type.\n    // 2. The object is not an instance of a subclass.\n    if (safeStyleSheet instanceof SafeStyleSheet &&\n        safeStyleSheet.constructor === SafeStyleSheet) {\n      return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;\n    } else {\n      fail(\n          'expected object of type SafeStyleSheet, got \\'' + safeStyleSheet +\n          '\\' of type ' + goog.typeOf(safeStyleSheet));\n      return 'type_error:SafeStyleSheet';\n    }\n  }\n\n  /**\n   * Package-internal utility method to create SafeStyleSheet instances.\n   *\n   * @param {string} styleSheet The string to initialize the SafeStyleSheet\n   *     object with.\n   * @return {!SafeStyleSheet} The initialized SafeStyleSheet object.\n   * @package\n   */\n  static createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet) {\n    return new SafeStyleSheet(styleSheet, CONSTRUCTOR_TOKEN_PRIVATE);\n  }\n}\n\n/**\n * A SafeStyleSheet instance corresponding to the empty string.\n * @const {!SafeStyleSheet}\n */\nSafeStyleSheet.EMPTY =\n    SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse('');\n\n\nexports = SafeStyleSheet;\n","~:compiled-at",1692726680653,"~:source-map-json","{\n\"version\":3,\n\"file\":\"goog.html.safestylesheet.js\",\n\"lineCount\":91,\n\"mappings\":\"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\",\n\"sources\":[\"goog/html/safestylesheet.js\"],\n\"sourcesContent\":[\"/**\\n * @license\\n * Copyright The Closure Library Authors.\\n * SPDX-License-Identifier: Apache-2.0\\n */\\n\\n/**\\n * @fileoverview The SafeStyleSheet type and its builders.\\n *\\n * TODO(xtof): Link to document stating type contract.\\n */\\n\\ngoog.module('goog.html.SafeStyleSheet');\\ngoog.module.declareLegacyNamespace();\\n\\nconst Const = goog.require('goog.string.Const');\\nconst SafeStyle = goog.require('goog.html.SafeStyle');\\nconst TypedString = goog.require('goog.string.TypedString');\\nconst googObject = goog.require('goog.object');\\nconst {assert, fail} = goog.require('goog.asserts');\\nconst {contains} = goog.require('goog.string.internal');\\n\\n/**\\n * Token used to ensure that object is created only from this file. No code\\n * outside of this file can access this token.\\n * @const {!Object}\\n */\\nconst CONSTRUCTOR_TOKEN_PRIVATE = {};\\n\\n/**\\n * A string-like object which represents a CSS style sheet and that carries the\\n * security type contract that its value, as a string, will not cause untrusted\\n * script execution (XSS) when evaluated as CSS in a browser.\\n *\\n * Instances of this type must be created via the factory method\\n * `SafeStyleSheet.fromConstant` and not by invoking its constructor. The\\n * constructor intentionally takes an extra parameter that cannot be constructed\\n * outside of this file and the type is immutable; hence only a default instance\\n * corresponding to the empty string can be obtained via constructor invocation.\\n *\\n * A SafeStyleSheet's string representation can safely be interpolated as the\\n * content of a style element within HTML. The SafeStyleSheet string should\\n * not be escaped before interpolation.\\n *\\n * Values of this type must be composable, i.e. for any two values\\n * `styleSheet1` and `styleSheet2` of this type,\\n * `SafeStyleSheet.unwrap(styleSheet1) + SafeStyleSheet.unwrap(styleSheet2)`\\n * must itself be a value that satisfies the SafeStyleSheet type constraint.\\n * This requirement implies that for any value `styleSheet` of this type,\\n * `SafeStyleSheet.unwrap(styleSheet1)` must end in\\n * \\\"beginning of rule\\\" context.\\n *\\n * A SafeStyleSheet can be constructed via security-reviewed unchecked\\n * conversions. In this case producers of SafeStyleSheet must ensure themselves\\n * that the SafeStyleSheet does not contain unsafe script. Note in particular\\n * that `&lt;` is dangerous, even when inside CSS strings, and so should\\n * always be forbidden or CSS-escaped in user controlled input. For example, if\\n * `&lt;/style&gt;&lt;script&gt;evil&lt;/script&gt;\\\"` were interpolated\\n * inside a CSS string, it would break out of the context of the original\\n * style element and `evil` would execute. Also note that within an HTML\\n * style (raw text) element, HTML character references, such as\\n * `&amp;lt;`, are not allowed. See\\n * http://www.w3.org/TR/html5/scripting-1.html#restrictions-for-contents-of-script-elements\\n * (similar considerations apply to the style element).\\n *\\n * @see SafeStyleSheet#fromConstant\\n * @final\\n * @implements {TypedString}\\n */\\nclass SafeStyleSheet {\\n  /**\\n   * @param {string} value\\n   * @param {!Object} token package-internal implementation detail.\\n   */\\n  constructor(value, token) {\\n    /**\\n     * The contained value of this SafeStyleSheet.  The field has a purposely\\n     * ugly name to make (non-compiled) code that attempts to directly access\\n     * this field stand out.\\n     * @private {string}\\n     */\\n    this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ =\\n        (token === CONSTRUCTOR_TOKEN_PRIVATE) ? value : '';\\n\\n    /**\\n     * @override\\n     * @const\\n     */\\n    this.implementsGoogStringTypedString = true;\\n  }\\n\\n  /**\\n   * Returns a string-representation of this value.\\n   *\\n   * To obtain the actual string value wrapped in a SafeStyleSheet, use\\n   * `SafeStyleSheet.unwrap`.\\n   *\\n   * @return {string}\\n   * @see SafeStyleSheet#unwrap\\n   * @override\\n   */\\n  toString() {\\n    return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_.toString();\\n  }\\n\\n  /**\\n   * Creates a style sheet consisting of one selector and one style definition.\\n   * Use {@link SafeStyleSheet.concat} to create longer style sheets.\\n   * This function doesn't support @import, @media and similar constructs.\\n   * @param {string} selector CSS selector, e.g. '#id' or 'tag .class, #id'. We\\n   *     support CSS3 selectors: https://w3.org/TR/css3-selectors/#selectors.\\n   * @param {!SafeStyle.PropertyMap|!SafeStyle} style Style\\n   *     definition associated with the selector.\\n   * @return {!SafeStyleSheet}\\n   * @throws {!Error} If invalid selector is provided.\\n   */\\n  static createRule(selector, style) {\\n    if (contains(selector, '<')) {\\n      throw new Error(`Selector does not allow '<', got: ${selector}`);\\n    }\\n\\n    // Remove strings.\\n    const selectorToCheck =\\n        selector.replace(/('|\\\")((?!\\\\1)[^\\\\r\\\\n\\\\f\\\\\\\\]|\\\\\\\\[\\\\s\\\\S])*\\\\1/g, '');\\n\\n    // Check characters allowed in CSS3 selectors.\\n    if (!/^[-_a-zA-Z0-9#.:* ,>+~[\\\\]()=^$|]+$/.test(selectorToCheck)) {\\n      throw new Error(\\n          'Selector allows only [-_a-zA-Z0-9#.:* ,>+~[\\\\\\\\]()=^$|] and ' +\\n          'strings, got: ' + selector);\\n    }\\n\\n    // Check balanced () and [].\\n    if (!SafeStyleSheet.hasBalancedBrackets_(selectorToCheck)) {\\n      throw new Error(\\n          '() and [] in selector must be balanced, got: ' + selector);\\n    }\\n\\n    if (!(style instanceof SafeStyle)) {\\n      style = SafeStyle.create(style);\\n    }\\n    const styleSheet =\\n        `${selector}{` + SafeStyle.unwrap(style).replace(/</g, '\\\\\\\\3C ') + '}';\\n    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(\\n        styleSheet);\\n  }\\n\\n  /**\\n   * Checks if a string has balanced () and [] brackets.\\n   * @param {string} s String to check.\\n   * @return {boolean}\\n   * @private\\n   */\\n  static hasBalancedBrackets_(s) {\\n    const brackets = {'(': ')', '[': ']'};\\n    const expectedBrackets = [];\\n    for (let i = 0; i < s.length; i++) {\\n      const ch = s[i];\\n      if (brackets[ch]) {\\n        expectedBrackets.push(brackets[ch]);\\n      } else if (googObject.contains(brackets, ch)) {\\n        if (expectedBrackets.pop() != ch) {\\n          return false;\\n        }\\n      }\\n    }\\n    return expectedBrackets.length == 0;\\n  }\\n\\n  /**\\n   * Creates a new SafeStyleSheet object by concatenating values.\\n   * @param {...(!SafeStyleSheet|!Array<!SafeStyleSheet>)}\\n   *     var_args Values to concatenate.\\n   * @return {!SafeStyleSheet}\\n   */\\n  static concat(var_args) {\\n    let result = '';\\n\\n    /**\\n     * @param {!SafeStyleSheet|!Array<!SafeStyleSheet>}\\n     *     argument\\n     */\\n    const addArgument = argument => {\\n      if (Array.isArray(argument)) {\\n        argument.forEach(addArgument);\\n      } else {\\n        result += SafeStyleSheet.unwrap(argument);\\n      }\\n    };\\n\\n    Array.prototype.forEach.call(arguments, addArgument);\\n    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(\\n        result);\\n  }\\n\\n  /**\\n   * Creates a SafeStyleSheet object from a compile-time constant string.\\n   *\\n   * `styleSheet` must not have any &lt; characters in it, so that\\n   * the syntactic structure of the surrounding HTML is not affected.\\n   *\\n   * @param {!Const} styleSheet A compile-time-constant string from\\n   *     which to create a SafeStyleSheet.\\n   * @return {!SafeStyleSheet} A SafeStyleSheet object initialized to\\n   *     `styleSheet`.\\n   */\\n  static fromConstant(styleSheet) {\\n    const styleSheetString = Const.unwrap(styleSheet);\\n    if (styleSheetString.length === 0) {\\n      return SafeStyleSheet.EMPTY;\\n    }\\n    // > is a valid character in CSS selectors and there's no strict need to\\n    // block it if we already block <.\\n    assert(\\n        !contains(styleSheetString, '<'),\\n        `Forbidden '<' character in style sheet string: ${styleSheetString}`);\\n    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(\\n        styleSheetString);\\n  }\\n\\n  /**\\n   * Returns this SafeStyleSheet's value as a string.\\n   *\\n   * IMPORTANT: In code where it is security relevant that an object's type is\\n   * indeed `SafeStyleSheet`, use `SafeStyleSheet.unwrap`\\n   * instead of this method. If in doubt, assume that it's security relevant. In\\n   * particular, note that goog.html functions which return a goog.html type do\\n   * not guarantee the returned instance is of the right type. For example:\\n   *\\n   * <pre>\\n   * var fakeSafeHtml = new String('fake');\\n   * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;\\n   * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);\\n   * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by\\n   * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml\\n   * // instanceof goog.html.SafeHtml.\\n   * </pre>\\n   *\\n   * @see SafeStyleSheet#unwrap\\n   * @override\\n   */\\n  getTypedStringValue() {\\n    return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;\\n  }\\n\\n  /**\\n   * Performs a runtime check that the provided object is indeed a\\n   * SafeStyleSheet object, and returns its value.\\n   *\\n   * @param {!SafeStyleSheet} safeStyleSheet The object to extract from.\\n   * @return {string} The safeStyleSheet object's contained string, unless\\n   *     the run-time type check fails. In that case, `unwrap` returns an\\n   *     innocuous string, or, if assertions are enabled, throws\\n   *     `asserts.AssertionError`.\\n   */\\n  static unwrap(safeStyleSheet) {\\n    // Perform additional Run-time type-checking to ensure that\\n    // safeStyleSheet is indeed an instance of the expected type.  This\\n    // provides some additional protection against security bugs due to\\n    // application code that disables type checks.\\n    // Specifically, the following checks are performed:\\n    // 1. The object is an instance of the expected type.\\n    // 2. The object is not an instance of a subclass.\\n    if (safeStyleSheet instanceof SafeStyleSheet &&\\n        safeStyleSheet.constructor === SafeStyleSheet) {\\n      return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;\\n    } else {\\n      fail(\\n          'expected object of type SafeStyleSheet, got \\\\'' + safeStyleSheet +\\n          '\\\\' of type ' + goog.typeOf(safeStyleSheet));\\n      return 'type_error:SafeStyleSheet';\\n    }\\n  }\\n\\n  /**\\n   * Package-internal utility method to create SafeStyleSheet instances.\\n   *\\n   * @param {string} styleSheet The string to initialize the SafeStyleSheet\\n   *     object with.\\n   * @return {!SafeStyleSheet} The initialized SafeStyleSheet object.\\n   * @package\\n   */\\n  static createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet) {\\n    return new SafeStyleSheet(styleSheet, CONSTRUCTOR_TOKEN_PRIVATE);\\n  }\\n}\\n\\n/**\\n * A SafeStyleSheet instance corresponding to the empty string.\\n * @const {!SafeStyleSheet}\\n */\\nSafeStyleSheet.EMPTY =\\n    SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse('');\\n\\n\\nexports = SafeStyleSheet;\\n\"],\n\"names\":[\"goog\",\"module\",\"declareLegacyNamespace\",\"Const\",\"require\",\"SafeStyle\",\"TypedString\",\"googObject\",\"assert\",\"fail\",\"contains\",\"CONSTRUCTOR_TOKEN_PRIVATE\",\"SafeStyleSheet\",\"constructor\",\"value\",\"token\",\"privateDoNotAccessOrElseSafeStyleSheetWrappedValue_\",\"implementsGoogStringTypedString\",\"toString\",\"createRule\",\"selector\",\"style\",\"Error\",\"selectorToCheck\",\"replace\",\"test\",\"hasBalancedBrackets_\",\"create\",\"styleSheet\",\"unwrap\",\"createSafeStyleSheetSecurityPrivateDoNotAccessOrElse\",\"s\",\"brackets\",\"expectedBrackets\",\"i\",\"length\",\"ch\",\"push\",\"pop\",\"concat\",\"var_args\",\"result\",\"addArgument\",\"argument\",\"Array\",\"isArray\",\"forEach\",\"prototype\",\"call\",\"arguments\",\"fromConstant\",\"styleSheetString\",\"EMPTY\",\"getTypedStringValue\",\"safeStyleSheet\",\"typeOf\",\"exports\"]\n}\n"]