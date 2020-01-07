// modules
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { SharedModule } from '../shared.module';
import { RecordsRoutingModule } from './records-routing.module';

// components
import { RecordsListComponent } from './records-list/records-list.component';
import { RecordsAddEditComponent } from './records-add-edit/records-add-edit.component';
import { RecordsTableRowsComponent } from './records-rows/records-table-rows.component';
import { RecordDetailComponent } from './record-detail/record-detail.component';

// resolvers
import { RecordsListResolver } from './records-list/records-list-resolver';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    GlobalModule,
    NrptiCommonModule,
    SharedModule,
    NgxPaginationModule,
    NgbModule.forRoot(),
    InlineSVGModule.forRoot(),
    RecordsRoutingModule
  ],
  declarations: [RecordsListComponent, RecordsAddEditComponent, RecordsTableRowsComponent, RecordDetailComponent],
  providers: [RecordsListResolver],
  exports: []
})
export class RecordsModule {}