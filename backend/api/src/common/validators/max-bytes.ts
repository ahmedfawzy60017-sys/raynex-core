import { registerDecorator, ValidationOptions } from 'class-validator';

/** bcrypt only reads the first 72 BYTES; reject longer inputs instead of silently truncating them. */
export function MaxBytes(max: number, options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'maxBytes',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} must not exceed ${max} bytes`, ...options },
      validator: { validate: (value: unknown) => typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= max },
    });
  };
}
