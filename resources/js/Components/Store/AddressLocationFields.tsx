import {
    countries,
    isPortugal,
    municipalitiesForDistrict,
    portugalDistricts,
} from '@/lib/locations';

export type AddressLocationValues = {
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
};

type AddressLocationFieldsProps = {
    values: AddressLocationValues;
    onChange: (field: keyof AddressLocationValues, value: string) => void;
    errors: Record<string, string | undefined>;
    errorKey?: (field: keyof AddressLocationValues) => string;
};

function fieldError(
    field: keyof AddressLocationValues,
    errors: Record<string, string | undefined>,
    errorKey: (field: keyof AddressLocationValues) => string,
): string | undefined {
    return errors[errorKey(field)];
}

export default function AddressLocationFields({
    values,
    onChange,
    errors,
    errorKey = (field) => field,
}: AddressLocationFieldsProps) {
    const isPt = isPortugal(values.country);
    const municipalities = isPt
        ? municipalitiesForDistrict(values.state)
        : [];

    const handleCountryChange = (country: string) => {
        onChange('country', country);

        if (!isPortugal(country)) {
            return;
        }

        if (!portugalDistricts.some((district) => district.name === values.state)) {
            onChange('state', '');
            onChange('city', '');
        } else if (
            values.city &&
            !municipalitiesForDistrict(values.state).includes(values.city)
        ) {
            onChange('city', '');
        }
    };

    const handleDistrictChange = (district: string) => {
        onChange('state', district);

        if (!municipalitiesForDistrict(district).includes(values.city)) {
            onChange('city', '');
        }
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <label className="text-sm font-medium text-brand-800">
                    Morada *
                </label>
                <input
                    value={values.address_line_1}
                    onChange={(e) => onChange('address_line_1', e.target.value)}
                    className="input-field mt-1"
                    required
                />
                {fieldError('address_line_1', errors, errorKey) && (
                    <p className="mt-1 text-sm text-red-700">
                        {fieldError('address_line_1', errors, errorKey)}
                    </p>
                )}
            </div>

            <div className="sm:col-span-2">
                <label className="text-sm font-medium text-brand-800">
                    Complemento
                </label>
                <input
                    value={values.address_line_2}
                    onChange={(e) => onChange('address_line_2', e.target.value)}
                    className="input-field mt-1"
                />
            </div>

            <div className="sm:col-span-2">
                <label className="text-sm font-medium text-brand-800">
                    País *
                </label>
                <select
                    value={values.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="input-field mt-1"
                    required
                >
                    {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.name}
                        </option>
                    ))}
                </select>
                {fieldError('country', errors, errorKey) && (
                    <p className="mt-1 text-sm text-red-700">
                        {fieldError('country', errors, errorKey)}
                    </p>
                )}
            </div>

            {isPt ? (
                <>
                    <div>
                        <label className="text-sm font-medium text-brand-800">
                            Distrito *
                        </label>
                        <select
                            value={values.state}
                            onChange={(e) =>
                                handleDistrictChange(e.target.value)
                            }
                            className="input-field mt-1"
                            required
                        >
                            <option value="">Selecione o distrito</option>
                            {portugalDistricts.map((district) => (
                                <option
                                    key={district.name}
                                    value={district.name}
                                >
                                    {district.name}
                                </option>
                            ))}
                        </select>
                        {fieldError('state', errors, errorKey) && (
                            <p className="mt-1 text-sm text-red-700">
                                {fieldError('state', errors, errorKey)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-brand-800">
                            Concelho *
                        </label>
                        <select
                            value={values.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            className="input-field mt-1"
                            required
                            disabled={!values.state}
                        >
                            <option value="">
                                {values.state
                                    ? 'Selecione o concelho'
                                    : 'Escolha primeiro o distrito'}
                            </option>
                            {municipalities.map((municipality) => (
                                <option
                                    key={municipality}
                                    value={municipality}
                                >
                                    {municipality}
                                </option>
                            ))}
                        </select>
                        {fieldError('city', errors, errorKey) && (
                            <p className="mt-1 text-sm text-red-700">
                                {fieldError('city', errors, errorKey)}
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <label className="text-sm font-medium text-brand-800">
                            Cidade *
                        </label>
                        <input
                            value={values.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            className="input-field mt-1"
                            required
                        />
                        {fieldError('city', errors, errorKey) && (
                            <p className="mt-1 text-sm text-red-700">
                                {fieldError('city', errors, errorKey)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-brand-800">
                            Estado / Província
                        </label>
                        <input
                            value={values.state}
                            onChange={(e) => onChange('state', e.target.value)}
                            className="input-field mt-1"
                        />
                        {fieldError('state', errors, errorKey) && (
                            <p className="mt-1 text-sm text-red-700">
                                {fieldError('state', errors, errorKey)}
                            </p>
                        )}
                    </div>
                </>
            )}

            <div className={isPt ? '' : 'sm:col-span-2'}>
                <label className="text-sm font-medium text-brand-800">
                    Código postal *
                </label>
                <input
                    value={values.postal_code}
                    onChange={(e) => onChange('postal_code', e.target.value)}
                    className="input-field mt-1"
                    placeholder={isPt ? '0000-000' : undefined}
                    required
                />
                {fieldError('postal_code', errors, errorKey) && (
                    <p className="mt-1 text-sm text-red-700">
                        {fieldError('postal_code', errors, errorKey)}
                    </p>
                )}
            </div>
        </div>
    );
}
