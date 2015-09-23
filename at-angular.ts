module at {

    'use strict';

    const directiveProperties: string[] = [
        'compile',
        'controller',
        'controllerAs',
        'bindToController',
        'link',
        'name',
        'priority',
        'replace',
        'require',
        'restrict',
        'scope',
        'template',
        'templateUrl',
        'terminal',
        'transclude'
    ];

    /* tslint:disable:no-any no-console */
    export interface IClassAnnotationDecorator {
        (target: any): void;
        (t: any, key: string, index: number): void;
    }

    function implicitClassName(target: any): string {
        let funcNameRegex: any = /function (.{1,})\(/,
            results: any[] = (funcNameRegex).exec(target.toString());
        return results[1];
    }

    function getModule(module: string | angular.IModule): angular.IModule {
        return ((typeof module === 'string') ? angular.module(module) : module);
    }

    function instantiate(module: string | angular.IModule, name: string, mode: string): IClassAnnotationDecorator {
        return (target: any): void => {
            getModule(module)[mode](name || implicitClassName(target), target);
        };
    }

    export function attachInjects(target: any, ...args: any[]): any {
        (target.$inject || []).forEach((item: string, index: number) => {
            target.prototype[(item.charAt(0) === '$' ? '$' : '$$') + item] = args[index];
        });
        return target;
    }

    export interface IInjectAnnotation {
        (...args: any[]): IClassAnnotationDecorator;
    }

    export function inject(...args: string[]): at.IClassAnnotationDecorator {
        return (target: any, key?: string, index?: number): void => {
            if (angular.isNumber(index)) {
                target.$inject = target.$inject || [];
                target.$inject[index] = args[0];
            } else {
                target.$inject = args;
            }
        };
    }

    export interface IServiceAnnotation {
        (module: string | angular.IModule, serviceName?: string): IClassAnnotationDecorator;
    }

    export function service(module: string | angular.IModule, serviceName?: string): at.IClassAnnotationDecorator {
        return instantiate(module, serviceName, 'service');
    }

    export interface IControllerAnnotation {
        (module: string, ctrlName?: string): IClassAnnotationDecorator;
    }

    export function controller(module: string | angular.IModule, ctrlName?: string): at.IClassAnnotationDecorator {
        return instantiate(module, ctrlName, 'controller');
    }

    export interface IDirectiveAnnotation {
        (module: string | angular.IModule, directiveName?: string): IClassAnnotationDecorator;
    }

    export function directive(module: string | angular.IModule, directiveName?: string): at.IClassAnnotationDecorator {
        return (target: any): void => {
            let config: angular.IDirective;
            /* istanbul ignore else */
            if (target.controller) {
                controller(module, target.controller.split(' ').shift())(target);
            }
            config = directiveProperties.reduce((
                config: angular.IDirective,
                property: string
            ) => {
                return angular.isDefined(target[property]) ? angular.extend(config, { [property]: target[property] }) :
                    config; /* istanbul ignore next */
            }, { controller: target, scope: Boolean(target.templateUrl) });

            // Get implicit classname and remove trailing "Controller" or "Ctrl"
            let implicitDirectiveName: string = implicitClassName(target).replace(/(Controller|Ctrl)$/, '');

            // Lowercase first character 
            implicitDirectiveName = directiveName || implicitDirectiveName.charAt(0).toLowerCase() + implicitDirectiveName.slice(1);

            getModule(module).directive(directiveName || implicitDirectiveName, () => (config));
        };
    }

    export interface IClassFactoryAnnotation {
        (moduleName: string | angular.IModule, className?: string): IClassAnnotationDecorator;
    }

    export function classFactory(module: string | angular.IModule, className?: string): at.IClassAnnotationDecorator {
        return (target: any): void => {
            function factory(...args: any[]): any {
                return at.attachInjects(target, ...args);
            }
            /* istanbul ignore else */
            if (target.$inject && target.$inject.length > 0) {
                factory.$inject = target.$inject.slice(0);
            }
            getModule(module).factory(className || implicitClassName(target), factory);
        };
    }
    /* tslint:enable:no-any */
}
