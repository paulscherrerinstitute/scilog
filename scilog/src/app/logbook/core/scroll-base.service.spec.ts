import { TestBed } from '@angular/core/testing';

import { ScrollBaseService } from './scroll-base.service';
import { IDatasource } from 'ngx-ui-scroll';

describe('ScrollBaseService', () => {
  let service: ScrollBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScrollBaseService],
    });
    service = TestBed.inject(ScrollBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should decorate with isLoadedDecorator', async () => {
    const toDecorate = async (index, count, config) => index + count + config;
    const decorated = await service.isLoadedDecorator(toDecorate)(1, 2, 3);
    expect(decorated).toEqual(6);
  });

  it('should reset isLoaded flag after reset', async () => {
    service.datasource = { adapter: { reset: async () => ({}) } } as IDatasource;
    service.isLoaded = true;
    service.reset();
    expect(service.isLoaded).toEqual(false);
  });
});
