import { SelectField } from "@amplication/ui/design-system";
import { CustomProperty } from "../models";

type Props = {
  property: CustomProperty;
  fieldNamePrefix?: string;
};

function CustomPropertiesFormFieldMultiSelect({
  property,
  fieldNamePrefix,
}: Props) {
  const options = property.options?.map((option) => ({
    value: option.value,
    label: option.value,
    color: option.color,
  }));

  return (
    <SelectField
      isMulti
      label={property.name}
      name={`${fieldNamePrefix}properties.${property.key}`}
      options={options || []}
    />
  );
}

export default CustomPropertiesFormFieldMultiSelect;
