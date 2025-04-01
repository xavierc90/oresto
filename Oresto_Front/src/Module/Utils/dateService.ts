import { BehaviorSubject } from 'rxjs';

class DateService {
  private dateSubject = new BehaviorSubject<Date>(new Date());

  getDate() {
    return this.dateSubject.asObservable();
  }

  setDate(date: Date) {
    this.dateSubject.next(date);
  }
}

export const dateService = new DateService();
