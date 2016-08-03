/**
 * @ngdoc object
 * @name ngCrud.FieldType
 * @description
 * 
 * Defines the configuration for an object attribute
 * 
 * @example
 * <pre>
 * {
 *     displayName: 'String' //Name to display in forms or lists,
 *     type: '', //Type of the field
 *     required: false //Whether the field es required or not
 * }
 * </pre>
 */

/**
 * @ngdoc property
 * @name ngCrud.FieldType#type
 * @propertyOf ngCrud.FieldType
 * @returns {string} Name for field's type
 * 
 * @description Defines the type of the field. Currently the valid types are:
 * <ul>
 * <li>String</li>
 * <li>Image</li>
 * <li>Boolean</li>
 * <li>Reference</li>
 * <li>Date</li>
 * <li>Currency</li>
 * <li>Computed</li>
 * <li>Long</li>
 * <li>Number</li>
 * <li>Integer</li>
 * </ul>
 */

/**
 * @ngdoc property
 * @name ngCrud.FieldType#displayName
 * @propertyOf ngCrud.FieldType
 * @returns {string} Display name for the field
 * 
 * @description Defines the text to show on labels
 */

/**
 * @ngdoc property
 * @name ngCrud.FieldType#required
 * @propertyOf ngCrud.FieldType
 * @returns {boolean} Whether or not the field is required
 * 
 * @description Sets the field as required
 */

/**
 * @ngdoc overview
 * 
 * @name ngCrud
 * 
 * @description
 * 
 * Set of directives to handle specific model definition
 * 
 */

/**
 * @ngdoc object
 * @name ngCrud.ActionType
 * @description
 * 
 * Defines the configuration for an action
 * 
 * @example
 * <pre>
 * refresh: {
 *    displayName: 'Refresh',
 *    icon: 'refresh',
 *    fn: function (record) {},
 *    show: function(record){}
 * }
 * </pre>
 */

(function (ng) {
    var mod = ng.module('ngCrud', ['restangular', 'ui.bootstrap']);

    mod.constant('CrudTemplatesDir', 'src/crud/templates/');

})(window.angular);
