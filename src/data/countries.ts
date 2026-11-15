import type { LanguageCode } from '../types';

const COUNTRY_DATA =
  'AF:Asia/Kabul,AL:Europe/Tirane,DZ:Africa/Algiers,AD:Europe/Andorra,AO:Africa/Luanda,AG:America/Antigua,AR:America/Argentina/Buenos_Aires,AM:Asia/Yerevan,AU:Australia/Sydney|Australia/Brisbane|Australia/Adelaide|Australia/Darwin|Australia/Perth|Australia/Hobart,AT:Europe/Vienna,AZ:Asia/Baku,BS:America/Nassau,BH:Asia/Bahrain,BD:Asia/Dhaka,BB:America/Barbados,BY:Europe/Minsk,BE:Europe/Brussels,BZ:America/Belize,BJ:Africa/Porto-Novo,BT:Asia/Thimphu,BO:America/La_Paz,BA:Europe/Sarajevo,BW:Africa/Gaborone,BR:America/Sao_Paulo|America/Manaus|America/Fortaleza|America/Noronha|America/Rio_Branco,BN:Asia/Brunei,BG:Europe/Sofia,BF:Africa/Ouagadougou,BI:Africa/Bujumbura,CV:Atlantic/Cape_Verde,KH:Asia/Phnom_Penh,CM:Africa/Douala,CA:America/Toronto|America/Winnipeg|America/Edmonton|America/Vancouver|America/Halifax|America/St_Johns,CF:Africa/Bangui,TD:Africa/Ndjamena,CL:America/Santiago,CN:Asia/Shanghai,CO:America/Bogota,KM:Indian/Comoro,CG:Africa/Brazzaville,CD:Africa/Kinshasa|Africa/Lubumbashi,CR:America/Costa_Rica,CI:Africa/Abidjan,HR:Europe/Zagreb,CU:America/Havana,CY:Asia/Nicosia,CZ:Europe/Prague,DK:Europe/Copenhagen,DJ:Africa/Djibouti,DM:America/Dominica,DO:America/Santo_Domingo,EC:America/Guayaquil,EG:Africa/Cairo,SV:America/El_Salvador,GQ:Africa/Malabo,ER:Africa/Asmara,EE:Europe/Tallinn,SZ:Africa/Mbabane,ET:Africa/Addis_Ababa,FJ:Pacific/Fiji,FI:Europe/Helsinki,FR:Europe/Paris,GA:Africa/Libreville,GM:Africa/Banjul,GE:Asia/Tbilisi,DE:Europe/Berlin,GH:Africa/Accra,GR:Europe/Athens,GD:America/Grenada,GT:America/Guatemala,GN:Africa/Conakry,GW:Africa/Bissau,GY:America/Guyana,HT:America/Port-au-Prince,HN:America/Tegucigalpa,HK:Asia/Hong_Kong,HU:Europe/Budapest,IS:Atlantic/Reykjavik,IN:Asia/Kolkata,ID:Asia/Jakarta|Asia/Makassar|Asia/Jayapura,IR:Asia/Tehran,IQ:Asia/Baghdad,IE:Europe/Dublin,IL:Asia/Jerusalem,IT:Europe/Rome,JM:America/Jamaica,JP:Asia/Tokyo,JO:Asia/Amman,KZ:Asia/Almaty,KE:Africa/Nairobi,KI:Pacific/Tarawa,KP:Asia/Pyongyang,KR:Asia/Seoul,XK:Europe/Belgrade,KW:Asia/Kuwait,KG:Asia/Bishkek,LA:Asia/Vientiane,LV:Europe/Riga,LB:Asia/Beirut,LS:Africa/Maseru,LR:Africa/Monrovia,LY:Africa/Tripoli,LI:Europe/Vaduz,LT:Europe/Vilnius,LU:Europe/Luxembourg,MO:Asia/Macau,MG:Indian/Antananarivo,MW:Africa/Blantyre,MY:Asia/Kuala_Lumpur,MV:Indian/Maldives,ML:Africa/Bamako,MT:Europe/Malta,MH:Pacific/Majuro,MR:Africa/Nouakchott,MU:Indian/Mauritius,MX:America/Mexico_City|America/Cancun|America/Chihuahua|America/Tijuana,FM:Pacific/Pohnpei,MD:Europe/Chisinau,MC:Europe/Monaco,MN:Asia/Ulaanbaatar,ME:Europe/Podgorica,MA:Africa/Casablanca,MZ:Africa/Maputo,MM:Asia/Yangon,NA:Africa/Windhoek,NR:Pacific/Nauru,NP:Asia/Kathmandu,NL:Europe/Amsterdam,NZ:Pacific/Auckland,NI:America/Managua,NE:Africa/Niamey,NG:Africa/Lagos,MK:Europe/Skopje,NO:Europe/Oslo,OM:Asia/Muscat,PK:Asia/Karachi,PW:Pacific/Palau,PS:Asia/Hebron,PA:America/Panama,PG:Pacific/Port_Moresby,PY:America/Asuncion,PE:America/Lima,PH:Asia/Manila,PL:Europe/Warsaw,PT:Europe/Lisbon,PR:America/Puerto_Rico,QA:Asia/Qatar,RO:Europe/Bucharest,RU:Europe/Moscow|Europe/Kaliningrad|Asia/Yekaterinburg|Asia/Novosibirsk|Asia/Krasnoyarsk|Asia/Irkutsk|Asia/Yakutsk|Asia/Vladivostok|Asia/Kamchatka,RW:Africa/Kigali,KN:America/St_Kitts,LC:America/St_Lucia,VC:America/St_Vincent,WS:Pacific/Apia,SM:Europe/San_Marino,ST:Africa/Sao_Tome,SA:Asia/Riyadh,SN:Africa/Dakar,RS:Europe/Belgrade,SC:Indian/Mahe,SL:Africa/Freetown,SG:Asia/Singapore,SK:Europe/Bratislava,SI:Europe/Ljubljana,SB:Pacific/Guadalcanal,SO:Africa/Mogadishu,ZA:Africa/Johannesburg,SS:Africa/Juba,ES:Europe/Madrid|Atlantic/Canary,LK:Asia/Colombo,SD:Africa/Khartoum,SR:America/Paramaribo,SE:Europe/Stockholm,CH:Europe/Zurich,SY:Asia/Damascus,TW:Asia/Taipei,TJ:Asia/Dushanbe,TZ:Africa/Dar_es_Salaam,TH:Asia/Bangkok,TL:Asia/Dili,TG:Africa/Lome,TO:Pacific/Tongatapu,TT:America/Port_of_Spain,TN:Africa/Tunis,TR:Europe/Istanbul,TM:Asia/Ashgabat,TV:Pacific/Funafuti,UG:Africa/Kampala,UA:Europe/Kiev,AE:Asia/Dubai,GB:Europe/London,US:America/New_York|America/Chicago|America/Denver|America/Phoenix|America/Los_Angeles|America/Anchorage|Pacific/Honolulu,UY:America/Montevideo,UZ:Asia/Tashkent,VU:Pacific/Efate,VA:Europe/Vatican,VE:America/Caracas,VN:Asia/Ho_Chi_Minh,YE:Asia/Aden,ZM:Africa/Lusaka,ZW:Africa/Harare';

export const COUNTRY_TIMEZONES: Record<string, string[]> = {};
for (const entry of COUNTRY_DATA.split(',')) {
  const idx = entry.indexOf(':');
  COUNTRY_TIMEZONES[entry.slice(0, idx)] = entry.slice(idx + 1).split('|');
}

const ARABIC_COUNTRIES = new Set([
  'DZ', 'BH', 'EG', 'IQ', 'JO', 'KW', 'LB', 'LY', 'MA', 'MR', 'OM', 'PS', 'QA', 'SA', 'SD', 'SY', 'TN', 'AE', 'YE',
]);

const SPANISH_COUNTRIES = new Set([
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GQ', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'ES', 'UY', 'VE', 'PR',
]);

export function suggestLanguageForCountry(countryCode: string): LanguageCode | '' {
  if (countryCode === 'BD') return 'bn';
  if (countryCode === 'IN') return 'hi';
  if (ARABIC_COUNTRIES.has(countryCode)) return 'ar';
  if (SPANISH_COUNTRIES.has(countryCode)) return 'es';
  return '';
}

export function getCountryDisplayName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

export function getCityFromTimezone(tz: string): string {
  return String(tz).split('/').pop()?.replace(/_/g, ' ') || tz;
}
