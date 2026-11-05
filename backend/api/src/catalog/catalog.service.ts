import { Injectable } from '@nestjs/common';

// Canonical taxonomy seed, not a claim that all makes/models are populated.
const classes = [
  { id:'passenger-car', label:{en:'Passenger car',ar:'سيارة ركوب'}, groups:['sedan','hatchback','coupe','convertible','wagon'] },
  { id:'suv-crossover-mpv', label:{en:'SUV / Crossover / MPV',ar:'دفع رباعي / كروس أوفر / متعددة الاستخدام'}, groups:['suv','crossover','mpv','minivan'] },
  { id:'pickup-van', label:{en:'Pickup / Van',ar:'بيك أب / فان'}, groups:['pickup','panel-van','minibus'] },
  { id:'truck', label:{en:'Truck / Tractor unit',ar:'شاحنة / جرار قاطرة'}, groups:['light-truck','medium-truck','heavy-truck','tractor-unit'] },
  { id:'bus', label:{en:'Bus / Coach',ar:'حافلة / أتوبيس'}, groups:['city-bus','coach','school-bus'] },
  { id:'motorcycle', label:{en:'Motorcycle / Scooter / Moped',ar:'دراجة نارية / سكوتر / موبيد'}, groups:['motorcycle','scooter','moped'] },
  { id:'off-road', label:{en:'ATV / UTV / Off-road',ar:'دراجات ومركبات الطرق الوعرة'}, groups:['atv','utv','buggy','quad'] },
  { id:'trailer', label:{en:'Trailer / Caravan',ar:'مقطورة / كارافان'}, groups:['trailer','semi-trailer','caravan'] },
  { id:'agricultural', label:{en:'Agricultural machinery',ar:'معدات زراعية'}, groups:['tractor','harvester','sprayer'] },
  { id:'construction', label:{en:'Construction machinery',ar:'معدات إنشاء'}, groups:['excavator','loader','bulldozer','grader'] },
  { id:'special-purpose', label:{en:'Special-purpose / Emergency',ar:'مركبات خاصة / طوارئ'}, groups:['ambulance','fire-engine','police','utility'] },
];
const powertrains = ['petrol','diesel','mild-hybrid','full-hybrid','plug-in-hybrid','battery-electric','hydrogen-fuel-cell','lpg','cng','flex-fuel','two-stroke','four-stroke','other'];
@Injectable()
export class CatalogService {
  vehicleClasses() { return { data: classes, meta:{ source:'RAYNEX canonical taxonomy seed', completeness:'taxonomy-only', vehicleMakeModelCoverage:'not-yet-populated' } }; }
  powertrains() { return { data: powertrains.map(id=>({id})), meta:{ source:'RAYNEX canonical taxonomy seed', completeness:'taxonomy-only' } }; }
  coverage(vehicleClass?: string) {
    const selected = vehicleClass ? classes.filter(c=>c.id===vehicleClass) : classes;
    return { data:selected.map(c=>({ vehicleClass:c.id, taxonomy:'seeded', makes:'not-populated', models:'not-populated', exactVariant:'not-verified', diagnostics:'not-verified', parts:'not-verified', threeD:'not-verified' })), meta:{ meaning:'Coverage states describe current RAYNEX data ingestion, not market availability.' } };
  }
}
