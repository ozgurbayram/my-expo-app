import React, { forwardRef } from 'react';
import { Controller, FieldValues, RegisterOptions } from 'react-hook-form';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import BaseText from './BaseText';

interface InputProps extends Omit<TextInputProps, 'style'> {
  form: FieldValues;
  name: string;
  label: string;
  rules?: RegisterOptions;
  defaultValue?: string;
  className?: string;
  inputClassName?: string;
  prefix?: React.ReactNode;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      form,
      name,
      label,
      rules,
      defaultValue = '',
      className = '',
      inputClassName = '',
      prefix,
      ...rest
    },
    ref
  ) => {
    const { errors } = form.formState;
    const hasError = !!errors[name];

    return (
      <View className={`h-[48px] w-full ${className}`}>
        <View className="w-full flex-row items-center">
          {prefix && <View className="absolute left-4 z-10 h-full justify-center">{prefix}</View>}
          <Controller
            name={name}
            control={form.control}
            rules={rules}
            defaultValue={defaultValue}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={ref}
                className={`
                  bg-background text-text font-body h-[48px] w-full flex-1 rounded-md border border-slate-400 px-4
                  ${hasError ? 'border-error' : ''}
                  ${prefix ? 'pl-16' : ''}
                  ${inputClassName}
                `}
                style={{
                  borderWidth: StyleSheet.hairlineWidth,
                }}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder={label}
                placeholderTextColor="#9CA3AF"
                {...rest}
              />
            )}
          />
        </View>
        {hasError && (
          <BaseText variant="caption" className="text-error mt-2">
            {errors[name]?.message?.toString()}
          </BaseText>
        )}
      </View>
    );
  }
);

export default Input;
