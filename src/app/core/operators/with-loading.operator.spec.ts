import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';

import { withLoading } from './with-loading.operator';
import { LoadingService } from '../services/loading.service';

describe('withLoading operator', () => {
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    loadingService = TestBed.inject(LoadingService);
  });

  it('should call show() when subscribed', () => {
    of(1).pipe(withLoading(loadingService)).subscribe();
    expect(loadingService.loading()).toBeFalsy();
  });

  it('loading should be true while observable is active', () => {
    const subject = new Subject<number>();
    let loadingDuring = false;

    subject.pipe(withLoading(loadingService)).subscribe();
    loadingDuring = loadingService.loading();
    subject.complete();

    expect(loadingDuring).toBeTruthy();
    expect(loadingService.loading()).toBeFalsy();
  });

  it('should call hide() when observable completes', () => {
    of(42).pipe(withLoading(loadingService)).subscribe();
    expect(loadingService.loading()).toBeFalsy();
  });

  it('should call hide() when observable errors', () => {
    throwError(() => new Error('fail'))
      .pipe(withLoading(loadingService))
      .subscribe({ error: () => {} });
    expect(loadingService.loading()).toBeFalsy();
  });

  it('should call hide() when unsubscribed early', () => {
    const subject = new Subject<number>();
    const sub = subject.pipe(withLoading(loadingService)).subscribe();

    expect(loadingService.loading()).toBeTruthy();
    sub.unsubscribe();
    expect(loadingService.loading()).toBeFalsy();
  });

  it('should pass values through unchanged', () => {
    const results: number[] = [];
    of(1, 2, 3).pipe(withLoading(loadingService)).subscribe((v) => results.push(v));
    expect(results).toEqual([1, 2, 3]);
  });
});