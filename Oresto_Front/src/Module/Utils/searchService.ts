import { BehaviorSubject } from 'rxjs';

class SearchService {
  private searchSubject = new BehaviorSubject<string>('');

  getSearch() {
    return this.searchSubject.asObservable();
  }

  setSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }
}

export const searchService = new SearchService();
