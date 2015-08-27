# Introducción
Librería de AngularJS para crear aplicaciones web con operaciones CRUD y Maestro Detalle

# Instalación
Para importar ngCrud en su proyecto web, incluya la siguiente línea en su `index.html`

```html
<script src="https://rawgit.com/recursosCSWuniandes/ng-crud/master/dist/ngcrud-mocks.min.js"></script>
```

Adicionalmente, añada la dependencia al módulo que lo requiere:

```javascript
ng.module('mainApp', ['ngCrud']);
```

# Documentación
La documentación detallada puede encontrarse en su [wiki](https://github.com/recursosCSWuniandes/ng-crud/wiki)

# Preguntas frecuentes
##¿Por qué los archivos Javascript están creados dentro de una función?
En Javascript, existe el concepto de [Closure](http://javascriptissexy.com/understand-javascript-closures-with-ease/). En este caso, los closure se usan para poder crear variables privadas (como por ejemplo cuando se crea un módulo) y evitar que las mismas sean creadas en el objeto `window`. Esto tambien ayuda a optimizar el uso de la memoria.

```javascript
var a = 1;
console.log(a); //imprime 1
console.log(window.a); //imprime 1

(function(){
    var b = 1;
    console.log(b); //imprime 1
    console.log(window.b); //imprime undefined
})();
```

##¿Cómo extender un servicio?
Para extender un servicio y añadirle la funcionalidad para hacer solicitudes RESTful, es necesario inyectar la utilidad `CrudCreator` del módulo `ngCrud`. Esta utilidad cuenta con la función `extendService`, la cual recibe como parámetro el servicio a extender, y la URI con la cual debe comunicarse.

```javascript
mod.service('countryService', ['CrudCreator', 'country.uri', function (CrudCreator, uri) {
    CrudCreator.extendService(this, uri); //extensión de servicio

    //Se sobreescribe función de deleteRecord
    this.deleteRecord = function (record){
        //nuevo código
    };

    //Función nueva personalizada
    this.getMostPopulated = function(param){
            //Llamado a URI personalizada /countries/mostPopulated
            return this.api.customGET('mostPopulated');
    };

    //Se borra función para guardar objetos
    delete this.fetchRecord;
}]);
```

Al extender un servicio, se crean en él las siguientes propiedades:

* `api`: Objeto de **Restangular** configurado para realizar peticiones a la URI de la entidad asociada. Se debe usar este objeto cuando se quiera añadir funcionalidad al servicio.
* `url`: URI donde se encuentran desplegados los servicios correspondientes a la entidad asociada.
* `fetchRecords`: Función que realiza solicitud al backend de los registros de la entidad. Acepta paginación.
* `fetchRecord`: Función que realiza solicitud al backend de un registro específico.
* `saveRecord`: Función encargada de enviar una petición al servidor para crear o actualizar un registro. Si el registro tiene un atributo `id`, se envía una petición para actualizar, de lo contrario se envía una petición para crear el registro.
* `deleteRecord`: Función encargada de realizar una petición al backend para eliminar un registro a partir de su `id`.
* `extendController`: Función que permite extender un controlador para asignarle operaciones CRUD a través del servicio.

##¿Cómo extender un controlador?
Para extender un controlador igualmente se inyecta el servicio `CrudCreator`, y se invoca la función `extendController`

```javascript
countryModule.controller('countryCtrl', ['CrudCreator', '$scope', 'countryService', 'countryModel', function (CrudCreator, $scope, svc, model) {
    CrudCreator.extendController(this, svc, $scope, model, 'country', 'Country');
    this.loadrefOptions(); //Carga las referencias a otros modelos
    this.fetchRecords(); //Obtiene la primer página de registros
}]);
```

Al extender un controlador, se crean en él las siguientes propiedades:

###Variables del controlador
* `editMode`: Esta variable define si la aplicación se encuentra en modo de edición o no. En modo edición, es posible crear o editar un registro. De lo contrario se despliega la lista de registros.
* `readOnly`: Esta variable permite configurar la vista para esconder la funcionalidad de edición y permitir únicamente acciones de sólo lectura.
* `error`: Esta variable permite mostrar en pantalla un mensaje. No se debe interactuar directamente con esta variable. Para desplegar un mensaje debe usarse las funciones correspondientes.
* `globalActions`: Arreglo en que se almacenan las acciones globales disponibles en el controlador.
* `recordActions`: Arreglo en que se almacenan las acciones por registro disponibles en el controlador.

###Variables del scope
* `name`: establece el nombre con el cual se identificará los elementos del DOM.
* `displayName`: Nombre de despliegue a usar en el componente **toolbar**
* `model`: Variable que referencia el modelo de datos. Dicho modelo es definido en una constante del módulo y referenciado desde esta variable para poder accedido en el scope.
* `currentRecord`: Variable que almacena los datos del registro que está siendo editado en un momento específico.
* `records`: Variable que almacena los registros a listar.

###Funciones
* `showInfo`: Muestra el mensaje recibido por parámetro con la clase `alert-info` de Bootstrap.
* `showSuccess`: Muestra el mensaje recibido por parámetro con la clase `alert-success` de Bootstrap.
* `showWarning`: Muestra el mensaje recibido por parámetro con la clase `alert-warning` de Bootstrap.
* `showDanger`: Muestra el mensaje recibido por parámetro con la clase `alert-danger` de Bootstrap.
* `closeError`: Función usada para cerrar el mensaje desplegado actualmente.
* `fetchRecords`: Se encarga de solicitar la lista de registros al servicio, y mostrarlos en pantalla cuando se reciba la respuesta.
* `editRecord`: Se encarga de solicitar un registro específico al servicio de la entidad, para después desplegar sus atributos en el formulario con la posibilidad de editarlos.
* `createRecord`: Se encarga de desplegar el formulario para crear un nuevo registro.
* `deleteRecord`: Se encarga de indicar al servicio que se debe eliminar el registro seleccionado.
* `saveRecord`: Se encarga de pasar al servicio la entidad creada o modificada para que la persista en el backend.
* `loadRefOptions`: Se encarga de cargar en el modelo las opciones para los atributos tipo `Reference`. Esta función obtiene el servicio (cuyo nombre es almacenado en el campo `service` del atributo en el modelo), lo inyecta, y asigna al atributo `options` el valor retornado por `fetchRecords` (sin paginar).

###Atributos de paginación
Estas variables son creadas en el controlador y son usadas para definir el comportamiento de la paginación
* `pageChanged`: Función que determina el comportamiento de la aplicación cuando se selecciona una página distinta (correspondiente a la paginación de los datos)
* `maxSize`: Indica la cantidad máxima de páginas a mostrar en el paginador simultáneamente. En caso de haber más páginas que lo establecido, se muestra flechas para navegar a las siguientes.
* `itemsPerPage`: Indica la cantidad de registros a mostrar en cada página.
* `totalItems`: Cantidad total de registros en el servidor. Esta variable se usa para calcular la cantidad de páginas disponibles.
* `currentPage`: Variable que almacena la página que está siendo consultada actualmente.

##¿Cómo crear más acciones globales?
Para crear una nueva acción global basta con añadir al arreglo `globalActions` del controlador un nuevo objeto con los siguientes atributos:

* `name`: Identificador de la acción, debe ser único.
* `displayName`: Texto que se mostrará en el botón.
* `icon`: Sufijo de las clases de **[glyphicon](http://getbootstrap.com/components/#glyphicons) de Bootstrap**. Por ejemplo, si se quiere usar `glyphicon glyphicon-asterisk` basta con que esta propiedad contenga el texto `asterisk`.
* `show`: Función que determina cuando debe mostrarse el botón.
* `fn`: Función a ejecutar cuando se haga clic en el botón. Esta función debe poder ejecutarse desde el contexto global y no recibe parámetros.

```javascript
this.globalActions.push({
    name: 'leastPopulated',
    displayName: 'Least Populated',
    icon: 'star',
    fn: function () {
        self.getLeastPopulated();
    },
    show: function () {
        return true;
    }
});
```

##¿Cómo crear más acciones por registro?
Para crear una nueva acción por registro el proceso es similar al de [crear acciones globales](#cómo-crear-más-acciones-globales), con sólo dos diferencias:

* El objeto en el cual se almacenan las acciones por registro es `recordActions` en el controlador.
* La función `fn` debe recibir como parámetro el registro seleccionado.

##¿Cómo editar acciones?
Para editar una acción (sea global o por registro) es necesario conocer la propiedad `name` de la acción que se quiere sobreescribir. De esa manera, se busca en el arreglo de acciones y se hacen las ediciones corerspondientes.

```javascript
for(var n in this.globalActions){
    if(this.globalActions.hasOwnProperty(n)){
        var action = this.globalActions(n);
        if(action.name === 'create'){
            action.fn = function(){
                //nuevo comportamiento
                return;
            };
            exit;
        }
    }
}
```

De ser necesario hacer esto muchas veces, se recomiendo crear una función que busque en la colección de acciones la deseada:

```javascript
function findAction(actions, name){
    for(var n in actions){
        if(actions.hasOwnProperty(n)){
            var action = this.globalActions(n);
            if(action.name === name){
                return action;
            }
        }
    }
}

//Invocación de la función
var createAction = findAction(this.globalActions, 'create');
```

##¿Cómo funcionan las directivas?
En AngularJS existe el concepto de **directiva**. Las directivas son la manera de extender HTML para que éste pueda dar una idea de lo que hace la aplicación. Igualmente con las directivas es posible reutilizar componentes HTML, aumentando la facilidad de modificación.

**Enlace del scope**: En las directivas es posible definir un scope aislado, al cual se le puede asignar valores desde el contenedor de la directiva. De esta manera, se puede conectar con componentes exteriores a ella. (Ver [`$compile`](https://docs.angularjs.org/api/ng/service/$compile))

Existen tres manera de configurar los parámetros recibidos:

* `@`: Los elementos del scope definidos con este símbolo indican que el parámetro escrito en la directiva se tomará como texto plano.
* `=`: Indica que el parámetro es una variable.
* `&`: Indica que el parámetro es una función. Cuando se ejecute la función dentro de la directiva, esto se hará con el contexto definido en el contenedor externo.

##¿Cómo llamo a un servicio desde un controlador?
Para llamar a un servicio desde un controlador basta con realizar la inyección del mismo en la definición del controlador. La inyección de dependencias de AngularJS funciona a partir del nombre de cada componente (el cual debe ser único en toda la aplicación).

```javascript
mod.controller('sportCtrl', ['countryService', function (countryService) {
            //...
        }]);
```
##¿Cómo registro un nuevo módulo de AngularJS?
Para registrar un módulo en AngularJS es necesario invocar el servicio `angular.module` pasando dos parámetros

1. **Nombre del módulo**: Este parámetro define el nombre que tendrá el módulo en la aplicación. Los nombres de los módulos deben ser siempre únicos en toda la aplicación.
2. **Dependencias**: Este parámetro es un arreglo de `string` donde cada elemento es el nombre del módulo del cual depende aquel que se está creando. En caso de no depender de ningún módulo, este parámetro debe estar presente como un arreglo vacío

Ejemplo sin dependencias: `angular.module('mi_modulo1', []);`
Ejemplo con dependencias: `angular.module('mi_modulo2', ['ui-bootstrap'];`

> **Importante**: cuando no se usa el segundo parámetro, AngularJS entiende que se está solicitando un módulo ya creado. En caso de hacer esto y no exista un módulo con el nombre, se obtiene error.

##¿Cómo solicito un registro específico a partir de su ID?
Para obtener un objeto con Restangular, esto se puede realizar con su `id` y el objeto `api` creado en el servicio de la entidad.

Dentro del servicio podemos crear una función que retorne la promesa de la solicitud de un registro por su `id`:
```javascript
this.getRecordById = function(id){
    return this.api.get(id);
};
```
