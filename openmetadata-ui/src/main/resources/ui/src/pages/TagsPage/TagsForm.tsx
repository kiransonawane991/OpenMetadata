/*
 *  Copyright 2023 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Form, Modal, Typography } from 'antd';
import { VALIDATION_MESSAGES } from 'constants/constants';
import { ENTITY_NAME_REGEX } from 'constants/regex.constants';
import { DEFAULT_FORM_VALUE } from 'constants/Tags.constant';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldProp, FieldTypes, generateFormFields } from 'utils/formUtils';
import { RenameFormProps } from './TagsPage.interface';

const TagsForm = ({
  visible,
  onCancel,
  header,
  initialValues,
  onSubmit,
  showMutuallyExclusive = false,
  isLoading,
  isSystemTag,
}: RenameFormProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues]);

  const formFields: FieldProp[] = [
    {
      name: 'name',
      id: 'root/name',
      required: true,
      label: t('label.name'),
      type: FieldTypes.TEXT,
      rules: [
        {
          pattern: ENTITY_NAME_REGEX,
          message: t('message.entity-name-validation'),
        },
        { type: 'string', min: 2, max: 64 },
      ],
      props: {
        'data-testid': 'name',
        disabled: isSystemTag,
      },
      placeholder: t('label.name'),
    },
    {
      name: 'displayName',
      id: 'root/displayName',
      required: false,
      label: t('label.display-name'),
      type: FieldTypes.TEXT,
      props: {
        'data-testid': 'displayName',
      },
      placeholder: t('label.display-name'),
    },
    {
      name: 'description',
      required: true,
      label: t('label.description'),
      id: 'root/description',
      type: FieldTypes.DESCRIPTION,
      props: {
        'data-testid': 'description',
        initialValue: '',
      },
      formItemProps: {
        trigger: 'onTextChange',
        valuePropName: 'initialValue',
      },
    },
    ...(showMutuallyExclusive
      ? ([
          {
            name: 'mutuallyExclusive',
            label: t('label.mutually-exclusive'),
            type: FieldTypes.SWITCH,
            required: false,
            props: {
              'data-testid': 'mutually-exclusive-button',
            },
            id: 'root/mutuallyExclusive',
            formItemLayout: 'horizontal',
            formItemProps: {
              valuePropName: 'checked',
            },
          },
        ] as FieldProp[])
      : []),
  ];

  return (
    <Modal
      centered
      destroyOnClose
      closable={false}
      data-testid="modal-container"
      okButtonProps={{
        form: 'tags',
        type: 'primary',
        htmlType: 'submit',
        loading: isLoading,
      }}
      okText={t('label.save')}
      open={visible}
      title={
        <Typography.Text strong data-testid="header">
          {header}
        </Typography.Text>
      }
      width={750}
      onCancel={() => {
        form.setFieldsValue(DEFAULT_FORM_VALUE);
        onCancel();
      }}>
      <Form
        form={form}
        initialValues={initialValues ?? DEFAULT_FORM_VALUE}
        layout="vertical"
        name="tags"
        validateMessages={VALIDATION_MESSAGES}
        onFinish={(data) => {
          onSubmit(data);
          form.setFieldsValue(DEFAULT_FORM_VALUE);
        }}>
        {generateFormFields(formFields)}
      </Form>
    </Modal>
  );
};

export default TagsForm;
