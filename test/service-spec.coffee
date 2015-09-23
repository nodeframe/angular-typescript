'use strict';

describe 'annotations:', ->

  beforeEach module 'test'

  describe '@service', ->
    deps = null
    testServiceTwo = null
    testServiceWithoutClassName = null

    beforeEach inject (_$http_, _$parse_, _testServiceTwo_,_TestServiceWithoutClassName_) ->
      deps =
        $http: _$http_
        $parse: _$parse_
      testServiceTwo = _testServiceTwo_
      testServiceWithoutClassName = _TestServiceWithoutClassName_

    it 'should be defined', ->

      expect at.service
      .toEqual jasmine.any Function

    it 'should instantiate decorated class as new service', ->

      expect testServiceTwo
      .toBeDefined()

      expect testServiceWithoutClassName
      .toBeDefined()

      expect testServiceTwo
      .toEqual jasmine.any test.TestServiceTwo

      expect testServiceWithoutClassName
      .toEqual jasmine.any test.TestServiceWithoutClassName

    it 'should pass proper dependencies (based on static member "$inject") to service constructor', ->

      for dep in test.TestServiceTwo.$inject
        expect testServiceTwo["$$#{ dep.replace('$', '') }"]
        .toBe deps[dep]

      for dep in test.TestServiceWithoutClassName.$inject
        expect testServiceWithoutClassName["$$#{ dep.replace('$', '') }"]
        .toBe deps[dep]


