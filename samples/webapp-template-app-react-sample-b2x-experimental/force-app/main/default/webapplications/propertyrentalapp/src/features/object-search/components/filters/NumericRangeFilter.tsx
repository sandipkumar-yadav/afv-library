import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";
import { useFilterField } from "../FilterContext";
import type { ActiveFilterValue } from "../../utils/filterUtils";

interface NumericRangeFilterProps extends Omit<React.ComponentProps<"div">, "onChange"> {
	field: string;
	label: string;
	helpText?: string;
	minInputProps?: React.ComponentProps<typeof Input>;
	maxInputProps?: React.ComponentProps<typeof Input>;
}

export function NumericRangeFilter({
	field,
	label,
	helpText,
	className,
	minInputProps,
	maxInputProps,
	...props
}: NumericRangeFilterProps) {
	const { value, onChange } = useFilterField(field);
	return (
		<div className={cn("space-y-1.5", className)} {...props}>
			<Label>{label}</Label>
			<NumericRangeFilterInputs
				field={field}
				label={label}
				value={value}
				onChange={onChange}
				minInputProps={minInputProps}
				maxInputProps={maxInputProps}
			/>
			{helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
		</div>
	);
}

interface NumericRangeFilterInputsProps extends Omit<React.ComponentProps<"div">, "onChange"> {
	field: string;
	label: string;
	value: ActiveFilterValue | undefined;
	onChange: (value: ActiveFilterValue | undefined) => void;
	minInputProps?: React.ComponentProps<typeof Input>;
	maxInputProps?: React.ComponentProps<typeof Input>;
}

export function NumericRangeFilterInputs({
	field,
	label,
	value,
	onChange,
	className,
	minInputProps,
	maxInputProps,
	...props
}: NumericRangeFilterInputsProps) {
	const validateNumericRangeFilter = (filter: ActiveFilterValue) => {
		if (filter.type !== "numeric") return null;

		const min = filter.min?.trim();
		const max = filter.max?.trim();
		const filterLabel = filter.label || filter.field;

		if (!min || !max) return null;

		const minValue = Number(min);
		const maxValue = Number(max);
		if (!Number.isNaN(minValue) && !Number.isNaN(maxValue) && minValue >= maxValue) {
			return `${filterLabel}: minimum value must be less than maximum value.`;
		}

		return null;
	};

	const handleChange = (bound: "min" | "max", v: string) => {
		const next = {
			field,
			label,
			type: "numeric" as const,
			min: value?.min ?? "",
			max: value?.max ?? "",
			[bound]: v,
		};

		if (!next.min && !next.max) {
			onChange(undefined);
		} else {
			onChange(next);
		}
	};

	const handleBlur = (bound: "min" | "max", currentValue: string) => {
		const next = {
			field,
			label,
			type: "numeric" as const,
			min: bound === "min" ? currentValue : (value?.min ?? ""),
			max: bound === "max" ? currentValue : (value?.max ?? ""),
		};
		const validationError = validateNumericRangeFilter(next);
		if (validationError) {
			toast.error("Invalid range filter", { description: validationError });
		}
	};

	return (
		<div className={cn("flex gap-2", className)} {...props}>
			<Input
				type="number"
				placeholder="Min"
				value={value?.min ?? ""}
				onChange={(e) => handleChange("min", e.target.value)}
				onBlur={(e) => handleBlur("min", e.target.value)}
				aria-label={`${label} minimum`}
				{...minInputProps}
			/>
			<Input
				type="number"
				placeholder="Max"
				value={value?.max ?? ""}
				onChange={(e) => handleChange("max", e.target.value)}
				onBlur={(e) => handleBlur("max", e.target.value)}
				aria-label={`${label} maximum`}
				{...maxInputProps}
			/>
		</div>
	);
}
