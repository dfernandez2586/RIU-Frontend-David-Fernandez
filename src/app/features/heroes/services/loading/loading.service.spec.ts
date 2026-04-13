import { TestBed } from '@angular/core/testing';
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
    expect(service.loading()).toBeFalsy();
  });

  it('hide() should set loading to false', () => {
    service.show();
    service.hide();
    expect(service.loading()).toBeFalsy();
  });

  it('loading should be a readonly signal', () => {
    expect(typeof service.loading).toBe('function');
    expect((service.loading as any).set).toBeUndefined();
  });
});