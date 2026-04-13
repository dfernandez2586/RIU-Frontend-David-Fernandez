import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../../features/heroes/services/loading/loading.service';

describe('loadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => httpMock.verify());

  // it('should call show() when a request starts', () => {
  //   spyOn(loadingService, 'show').and.callThrough();
  //   httpClient.get('/test').subscribe();
  //   expect(loadingService.show).toHaveBeenCalled();
  //   httpMock.expectOne('/test').flush({});
  // });

  // it('should call hide() when a request completes', () => {
  //   spyOn(loadingService, 'hide').and.callThrough();
  //   httpClient.get('/test').subscribe();
  //   httpMock.expectOne('/test').flush({});
  //   expect(loadingService.hide).toHaveBeenCalled();
  // });

  // it('should call hide() even when a request errors', () => {
  //   spyOn(loadingService, 'hide').and.callThrough();
  //   httpClient.get('/test').subscribe({ error: () => {} });
  //   httpMock
  //     .expectOne('/test')
  //     .flush('error', { status: 500, statusText: 'Server Error' });
  //   expect(loadingService.hide).toHaveBeenCalled();
  // });

  it('loading should be true during the request', () => {
    httpClient.get('/test').subscribe();
    expect(loadingService.loading()).toBeTruthy();
    httpMock.expectOne('/test').flush({});
    expect(loadingService.loading()).toBeFalsy();
  });
});

function spyOn(loadingService: LoadingService, arg1: string) {
  throw new Error('Function not implemented.');
}
