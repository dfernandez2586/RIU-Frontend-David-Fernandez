import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export function withLoading<T>(loadingService: LoadingService) {
  return (source: Observable<T>): Observable<T> => {
    loadingService.show();
    return source.pipe(finalize(() => loadingService.hide()));
  };
}