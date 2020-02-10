import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecordsListComponent } from './records-list/records-list.component';
import { RecordsListResolver } from './records-list/records-list-resolver';

import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { OrderResolver } from './orders/order-detail/order-resolver';

import { InspectionDetailComponent } from './inspections/inspection-detail/inspection-detail.component';
import { InspectionResolver } from './inspections/inspection-detail/inspection-resolver';

import { RestorativeJusticeDetailComponent } from './restorative-justices/restorative-justice-detail/restorative-justice-detail.component';
import { RestorativeJusticeResolver } from './restorative-justices/restorative-justice-resolver';

import { AdministrativePenaltyDetailComponent } from './administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { AdministrativePenaltyResolver } from './administrative-penalties/administrative-penalty-resolver';

const routes: Routes = [
  {
    path: 'records',
    data: {
      breadcrumb: 'Records List'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: RecordsListComponent,
        resolve: {
          records: RecordsListResolver
        }
      },
      {
        path: 'orders/:orderId',
        data: {
          breadcrumb: 'Order Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: OrderDetailComponent,
            resolve: {
              records: OrderResolver
            },
            data: {
              breadcrumb: null
            }
          }
        ]
      },
      {
        path: 'inspections/:inspectionId',
        data: {
          breadcrumb: 'Order Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: InspectionDetailComponent,
            resolve: {
              records: InspectionResolver
            },
            data: {
              breadcrumb: null
            }
          }
        ]
      },
      {
        path: 'restorative-justices/:restorativeJusticeId',
        data: {
          breadcrumb: 'Restorative Justice Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: RestorativeJusticeDetailComponent,
            resolve: {
              records: RestorativeJusticeResolver
            },
            data: {
              breadcrumb: null
      },
      {
        path: 'administrative-penalties/:administrativePenaltyId',
        data: {
          breadcrumb: 'Administrative Penalty Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: AdministrativePenaltyDetailComponent,
            resolve: {
              records: AdministrativePenaltyResolver
            },
            data: {
              breadcrumb: null
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [RecordsListResolver, OrderResolver, InspectionResolver, RestorativeJusticeResolver, AdministrativePenaltyResolver]
})
export class RecordsRoutingModule {}
