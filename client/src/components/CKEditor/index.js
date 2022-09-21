/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CKEditor } from 'ckeditor4-react';

const Editor = ({ value, onChange, ...custom }) => {
  const { index, onEditArrayItem, isEditItemInArray, name, placeholder } = custom;

  // 1. Dialog box upload => trigger onChange
  // 2. Drag & Drop
  // 3. Copy & Paste

  // => Use fileUploadResponse
  const handleChange = useCallback((e) => {
    if (isEditItemInArray) {
      onEditArrayItem(index, e.editor.getData());
    } else {
      onChange(e.editor.getData());
    }
  }, []);
  const handleFileUploadResponse = useCallback((evt) => {
    if (!evt) return;
    evt.stop();

    // // Get XHR and response.
    const data = evt.data;
    const xhr = data.fileLoader.xhr;
    const response = xhr.responseText.split('|');

    if (response[1]) {
      // An error occurred during upload.
      data.message = response[1];
      evt.cancel();
    } else {
      const res = JSON.parse(response[0]);
      data.url = res.url;
      setTimeout(() => {
        if (isEditItemInArray) {
          onEditArrayItem(index, evt.editor.getData());
        } else {
          onChange(evt.editor.getData());
        }
      });
    }
  }, []);

  return (
    <CKEditor
      initData={value}
      onChange={handleChange}
      onFileUploadResponse={handleFileUploadResponse}
      name={name}
      config={{
        placeholder,
        disableNativeSpellChecker: false,
        toolbar: [
          // { name: 'styles', items: ['Styles', 'Format', 'Source'] },
          // { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', 'Mathjax'] },
          // { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
          // { name: 'links', items: ['Link', 'Unlink'] },
          // { name: 'insert', items: ['Image', 'Table', 'SpecialChar'] },
          // { name: 'colors', items: ['TextColor', 'BGColor'] },
          // { name: 'about', items: ['About'] },
        ],
        // uploadUrl: `${getClientSiteConfig().apiBaseUrl}/api/media/images/upload`,
        // filebrowserUploadUrl: `${getClientSiteConfig().apiBaseUrl}/api/media/images/upload`,
        // mathJaxClass: 'math-tex',
        // mathJaxLib: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML',
        // extraPlugins: 'autogrow',
        autoGrow_minHeight: '100',
        autoGrow_onStartup: true,
        font_names: 'Roboto',
        readOnly: custom.readOnly
      }}
      {...custom}
    />
  );
};

export default Editor;