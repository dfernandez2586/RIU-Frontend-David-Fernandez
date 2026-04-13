import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loading signal should start as false', () => {
    expect(service.loading()).toBe(false);
  });

  it('show() should set loading to true', () => {
    service.show();
    expect(service.loading()).toBe(true);
  });

  it('hide() should set loading to false', () => {
    service.show();
    service.hide();
    expect(service.loading()).toBe(false);
  });

  it('should stay true if there are multiple active requests', () => {
    service.show();
    service.show();

    expect(service.loading()).toBe(true);

    service.hide();

    expect(service.loading()).toBe(true);

    service.hide();

    expect(service.loading()).toBe(false);
  });

  it('should never go below 0 requests', () => {
    service.hide(); 

    expect(service.loading()).toBe(false);
  });

  it('loading should be a readonly signal', () => {
    expect(typeof service.loading).toBe('function');
    expect((service.loading as any).set).toBeUndefined();
  });
});