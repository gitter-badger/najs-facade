"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const Sinon = require("sinon");
const FacadeContainer_1 = require("../../lib/facades/FacadeContainer");
describe('FacadeContainer', function () {
    describe('static .clearBucket()', function () {
        it('filters and removes all container which can be cleanable', function () {
            const containerOne = new FacadeContainer_1.FacadeContainer(true);
            containerOne['anything'] = true;
            containerOne['usedFacaded'] = {};
            containerOne['keyByCount'] = {};
            const containerNotCleanable = new FacadeContainer_1.FacadeContainer();
            containerNotCleanable['anything'] = true;
            containerNotCleanable['usedFacaded'] = {};
            containerNotCleanable['keyByCount'] = {};
            const containerTwo = new FacadeContainer_1.FacadeContainer(true);
            containerTwo['anything'] = true;
            containerTwo['usedFacaded'] = {};
            containerTwo['keyByCount'] = {};
            FacadeContainer_1.FacadeContainer.Bucket.push(containerOne);
            FacadeContainer_1.FacadeContainer.Bucket.push(containerNotCleanable);
            FacadeContainer_1.FacadeContainer.Bucket.push(containerTwo);
            FacadeContainer_1.FacadeContainer.clearBucket();
            expect(FacadeContainer_1.FacadeContainer.Bucket).toEqual([containerNotCleanable]);
            expect(containerOne['anything']).toBeUndefined();
            expect(containerOne['usedFacaded']).toBeUndefined();
            expect(containerOne['keyByCount']).toBeUndefined();
            expect(containerNotCleanable['anything']).toEqual(true);
            expect(containerNotCleanable['usedFacaded']).toEqual({});
            expect(containerNotCleanable['keyByCount']).toEqual({});
            expect(containerTwo['anything']).toBeUndefined();
            expect(containerTwo['usedFacaded']).toBeUndefined();
            expect(containerTwo['keyByCount']).toBeUndefined();
        });
    });
    describe('constructor()', function () {
        it('is initiated with cleanable = false by default', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            expect(container['cleanable']).toBe(false);
        });
        it('can be initiated with cleanable = true', function () {
            const container = new FacadeContainer_1.FacadeContainer(true);
            expect(container['cleanable']).toBe(true);
        });
    });
    describe('.clean()', function () {
        it('does nothing and return false if container is not cleanable', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            expect(container.clean()).toBe(false);
        });
        it('always returns true if container is cleanable', function () {
            const container = new FacadeContainer_1.FacadeContainer(true);
            expect(container.clean()).toBe(true);
        });
        it('deletes everything in container even the "usedFacades" variable', function () {
            const container = new FacadeContainer_1.FacadeContainer(true);
            container['anything'] = true;
            container['usedFacaded'] = {};
            container['keyByCount'] = {};
            expect(container.clean()).toBe(true);
            expect(container['anything']).toBeUndefined();
            expect(container['usedFacaded']).toBeUndefined();
            expect(container['keyByCount']).toBeUndefined();
        });
    });
    describe('.getKeyByCount()', function () {
        it('creates a keyByCount member automatically', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            expect(container['keyByCount']).toBeUndefined();
            container.getKeyByCount('test');
            expect(container['keyByCount']).toEqual({ test: 1 });
        });
        it('increases number by key', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            expect(container['keyByCount']).toBeUndefined();
            container.getKeyByCount('test{count}');
            expect(container['keyByCount']).toEqual({ 'test{count}': 1 });
            container.getKeyByCount('test{count}');
            expect(container['keyByCount']).toEqual({ 'test{count}': 2 });
            expect(container.getKeyByCount('test{count}')).toEqual('test3');
        });
    });
    describe('.markFacadeWasUsed()', function () {
        it('creates "usedFacades" based on "type" dynamically', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            expect(container['usedFacades']).toBeUndefined();
            container['markFacadeWasUsed']('test', 'spy');
            expect(typeof container['usedFacades'] === 'undefined').toBe(false);
            expect(container['usedFacades']['spy']).toEqual(['test']);
            expect(container['usedFacades']['stub']).toBeUndefined();
            expect(container['usedFacades']['mock']).toBeUndefined();
            container['markFacadeWasUsed']('test', 'stub');
            expect(container['usedFacades']['spy']).toEqual(['test']);
            expect(container['usedFacades']['stub']).toEqual(['test']);
            expect(container['usedFacades']['mock']).toBeUndefined();
            container['markFacadeWasUsed']('test', 'spy');
            expect(container['usedFacades']['spy']).toEqual(['test', 'test']);
            expect(container['usedFacades']['stub']).toEqual(['test']);
            expect(container['usedFacades']['mock']).toBeUndefined();
        });
    });
    describe('.verifyMocks()', function () {
        it('does nothing if "usedFacades" or "usedFacades".mock is not found', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const mock = { verify() { } };
            container['test_facade'] = {
                createdMocks: [mock]
            };
            const verifySpy = Sinon.spy(mock, 'verify');
            container['verifyMocks']();
            expect(verifySpy.called).toBe(false);
            container['usedFacades'] = {};
            container['verifyMocks']();
            expect(verifySpy.called).toBe(false);
        });
        it('does nothing if "accessorKey" not found in container', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const mock = { verify() { } };
            container['usedFacades'] = { mock: ['not-found'] };
            container['test_facade'] = {
                createdMocks: [mock]
            };
            const verifySpy = Sinon.spy(mock, 'verify');
            container['verifyMocks']();
            expect(verifySpy.called).toBe(false);
        });
        it('does nothing if "accessorKey".createdMocks not found', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const mock = { verify() { } };
            container['usedFacades'] = { mock: ['test_facade'] };
            container['test_facade'] = {
                notCreatedMocks: [mock]
            };
            const verifySpy = Sinon.spy(mock, 'verify');
            container['verifyMocks']();
            expect(verifySpy.called).toBe(false);
        });
        it('calls verify() for each instance in "createdMocks", just only one time', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const mock = { verify() { } };
            container['usedFacades'] = { mock: ['test_facade', 'test_facade'] };
            container['test_facade'] = {
                createdMocks: [mock]
            };
            const verifySpy = Sinon.spy(mock, 'verify');
            container['verifyMocks']();
            expect(verifySpy.calledOnce).toBe(true);
        });
    });
    describe('.restoreFacades()', function () {
        it('does nothing if "usedFacades" is not found', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const facade = { restoreFacade() { } };
            container['test_facade'] = facade;
            const restoreFacadeSpy = Sinon.spy(facade, 'restoreFacade');
            container['restoreFacades']();
            expect(restoreFacadeSpy.called).toBe(false);
        });
        it('merges and distinct facade instance, then loops all and call .restoreFacades()', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const facade = { restoreFacade() { } };
            container['usedFacades'] = {
                mock: ['facade1'],
                spy: ['facade1'],
                stub: ['facade2', 'not-found']
            };
            container['facade1'] = facade;
            container['facade2'] = facade;
            container['facade3'] = facade;
            const restoreFacadeSpy = Sinon.spy(facade, 'restoreFacade');
            container['restoreFacades']();
            expect(restoreFacadeSpy.calledTwice).toBe(true);
        });
        it('works if "usedFacades".mock is missing', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const facade = { restoreFacade() { } };
            container['usedFacades'] = {
                spy: ['facade1'],
                stub: ['facade2', 'not-found']
            };
            container['facade1'] = facade;
            container['facade2'] = facade;
            container['facade3'] = facade;
            const restoreFacadeSpy = Sinon.spy(facade, 'restoreFacade');
            container['restoreFacades']();
            expect(restoreFacadeSpy.calledTwice).toBe(true);
        });
        it('works if "usedFacades".spy is missing', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const facade = { restoreFacade() { } };
            container['usedFacades'] = {
                mock: ['facade1'],
                stub: ['facade2', 'not-found']
            };
            container['facade1'] = facade;
            container['facade2'] = facade;
            container['facade3'] = facade;
            const restoreFacadeSpy = Sinon.spy(facade, 'restoreFacade');
            container['restoreFacades']();
            expect(restoreFacadeSpy.calledTwice).toBe(true);
        });
        it('works if "usedFacades".stub is missing', function () {
            const container = new FacadeContainer_1.FacadeContainer();
            const facade = { restoreFacade() { } };
            container['usedFacades'] = {
                spy: ['facade1'],
                mock: ['facade1']
            };
            container['facade1'] = facade;
            container['facade2'] = facade;
            container['facade3'] = facade;
            const restoreFacadeSpy = Sinon.spy(facade, 'restoreFacade');
            container['restoreFacades']();
            expect(restoreFacadeSpy.calledOnce).toBe(true);
        });
    });
});
