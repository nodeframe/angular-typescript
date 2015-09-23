/* istanbul ignore next */

module at {

    'use strict';

    /* tslint:disable:no-any */
    type ResourceClass = angular.resource.IResourceClass<any>;
    type ResourceService = angular.resource.IResourceService;

    function implicitClassName(target: any): string {
        let funcNameRegex: any = /function (.{1,})\(/,
            results: any[] = (funcNameRegex).exec(target.toString());
        return results[1];
    }

    function getModule(module: string | angular.IModule): angular.IModule {
        return ((typeof module === 'string') ? angular.module(module) : module);
    }

    /* istanbul ignore next */
    function combineResource(instance: any, model?: any): void {
        angular.extend(instance, instance.$_Resource(model));
    }

    /* istanbul ignore next */
    export class Resource implements angular.resource.IResource<Resource> {
        public $promise : angular.IPromise<Resource>;
        public $resolved : boolean;
        public static get(): Resource { return new Resource(); }
        public static query(): Resource { return new Resource(); }
        public static remove(): Resource { return new Resource(); }
        public static save(): Resource { return new Resource(); }
        public static delete(): Resource { return new Resource(); }
        constructor(model?: any) { combineResource(this, model); }
        public $get(): angular.IPromise<Resource> { return this.$promise; }
        public $query(): angular.IPromise<Resource> { return this.$promise; }
        public $remove(): angular.IPromise<Resource> { return this.$promise; }
        public $save(): angular.IPromise<Resource> { return this.$promise; }
        public $delete(): angular.IPromise<Resource> { return this.$promise; }
    }

    /* istanbul ignore next */
    export class ResourceWithUpdate extends Resource  {
        public $promise : angular.IPromise<ResourceWithUpdate>;
        constructor(model?: any) { super(model); }
        public static update(): ResourceWithUpdate { return new ResourceWithUpdate(); }
        public $update(): angular.IPromise<ResourceWithUpdate> { return this.$promise; }
    }

    export interface IResourceAnnotation {
        (module: string | angular.IModule, className?: string): IClassAnnotationDecorator;
    }

    export function resource(module: string|angular.IModule, className: string): IClassAnnotationDecorator {
        return (target: any): void => {
            function resourceClassFactory($resource: ResourceService, ...args: any[]): any {
                const newResource: ResourceClass = $resource(target.url, target.params, target.actions, target.options);
                return attachInjects(angular.extend(newResource, angular.extend(target, newResource, {
                    prototype: angular.extend(newResource.prototype, angular.extend(target.prototype, {
                        /* tslint:disable:variable-name */
                        $_Resource: newResource
                        /* tslint:enable:variable-name */
                    }))
                })), ...args);
            }
            resourceClassFactory.$inject = (['$resource']).concat(target.$inject /* istanbul ignore next */ || []);
            getModule(module).factory(className || implicitClassName(target), resourceClassFactory);
        };
    }
    /* tslint:enable:no-any */

}
