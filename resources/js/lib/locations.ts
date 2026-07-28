import countriesData from '@/data/countries.json';
import portugalDistrictsData from '@/data/portugal-districts.json';

export type Country = {
    code: string;
    name: string;
};

export type PortugalDistrict = {
    name: string;
    municipalities: string[];
};

export const countries = countriesData as Country[];
export const portugalDistricts = portugalDistrictsData as PortugalDistrict[];

export const isPortugal = (countryCode: string): boolean =>
    countryCode.toUpperCase() === 'PT';

export function municipalitiesForDistrict(districtName: string): string[] {
    const district = portugalDistricts.find((item) => item.name === districtName);

    return district?.municipalities ?? [];
}

export function countryName(code: string): string {
    return (
        countries.find((country) => country.code === code.toUpperCase())?.name ??
        code
    );
}
