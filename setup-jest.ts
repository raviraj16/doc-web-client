// setup-jest.ts
import 'jest-preset-angular/setup-env/zone';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Create a proper sessionStorage mock
const createSessionStorageMock = () => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

// Mock sessionStorage globally for window and global objects
const sessionStorageMock = createSessionStorageMock();
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Add jasmine compatibility for Angular testing
(global as any).jasmine = {
  createSpyObj: (baseName: string, methodNames: string[]) => {
    const obj: any = {};
    for (const method of methodNames) {
      obj[method] = jest.fn();
      // Add Jasmine-style "and" method
      (obj[method] as any).and = {
        returnValue: (value: any) => obj[method].mockReturnValue(value),
      };
    }
    return obj;
  },
  createSpy: (name?: string) => {
    const fn = jest.fn();
    (fn as any).and = {
      returnValue: (value: any) => fn.mockReturnValue(value),
    };
    return fn;
  },
};

// Add global spyOn function for Jasmine compatibility
(global as any).spyOn = (object: any, method: string) => {
  const originalMethod = object[method];
  const spy = jest.spyOn(object, method);
  
  // Add Jasmine-style "and" methods
  (spy as any).and = {
    returnValue: (value: any) => spy.mockReturnValue(value),
    callThrough: () => spy.mockImplementation(originalMethod),
    stub: () => spy.mockImplementation(() => {}),
    throwError: (error: any) => spy.mockImplementation(() => { throw error; }),
    callFake: (fn: (...args: any[]) => any) => spy.mockImplementation(fn),
  };
  
  return spy;
};