import validator from 'validator';
import $ from 'jquery';

export const clearInput = input => input.val('');

export const isValidUrl = url => validator.isURL(url);

export const showModal = (instance, message) => {
  instance.find('[data-role="modal-content"]').html(message);
  instance.modal('toggle');
};

