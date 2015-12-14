/**
 * Created by keyan.hardman on 12/13/15.
 */
define(function () {
    return {
        getFormData: function (field) {
            var fieldValue = $(field).serializeArray();
            fieldValue = fieldValue[0].value.toString();
            return fieldValue;
        }
    };
});
