'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FormWrapper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Config = require('Config');

var _Repository = require('curvature/base/Repository');

var _Form = require('curvature/form/Form');

var _Toast = require('curvature/toast/Toast');

var _ToastAlert = require('curvature/toast/ToastAlert');

var _View2 = require('curvature/base/View');

var _Router = require('curvature/base/Router');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FormWrapper = exports.FormWrapper = function (_View) {
	_inherits(FormWrapper, _View);

	function FormWrapper(args, path) {
		var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
		var customFields = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

		_classCallCheck(this, FormWrapper);

		var _this = _possibleConstructorReturn(this, (FormWrapper.__proto__ || Object.getPrototypeOf(FormWrapper)).call(this, args));

		_this.args.method = method;
		_this.args.action = _this.args.action || null;
		_this.args.form = null;
		_this.args.title = null;
		_this.args.class = '';
		_this.template = '\n\t\t\t<div class = "form constrict [[class]]">\n\t\t\t\t<div cv-if = "title"><label>[[title]]</label></div>\n\t\t\t\t[[form]]\n\t\t\t</div>\n\t\t';

		_this._onLoad = [];
		_this._onRequest = [];
		_this._onResponse = [];

		_Repository.Repository.request(_Config.Config.backend + path).then(function (resp) {
			if (!resp || !resp.meta || !resp.meta.form || !(resp.meta.form instanceof Object)) {
				console.log('Cannot render form with ', resp);
				_Router.Router.go('/');
				return;
			}

			_this.args.form = new _Form.Form(resp.meta.form, customFields);

			_this.onLoad(_this.args.form, resp.body);

			_this.args.form.onSubmit(function (form, event) {
				event.preventDefault();
				event.stopPropagation();

				var formElement = form.tags.formTag.element;
				var uri = formElement.getAttribute('action') || _this.args.action || path;
				var method = formElement.getAttribute('method') || _this.args.method;
				var query = form.args.flatValue;

				method = method.toUpperCase();

				// console.log(method, uri);

				if (method == 'GET') {
					var _query = {};

					if (_this.args.content && _this.args.content.args) {
						_this.args.content.args.page = 0;
					}

					_query.page = 0;

					for (var i in query) {
						if (i === 'api') {
							continue;
						}
						_query[i] = query[i];
					}

					var promises = _this.onRequest(_query);

					promises.then(function () {
						_this.onResponse({});

						_Router.Router.go(uri + '?' + _Router.Router.queryToString(_query));

						_this.update(_query);
					}).catch(function (error) {
						_this.onRequestError(error);
					});
				} else if (method == 'POST') {
					var formData = form.formData();

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = formData.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							// console.log(pair[0]+ ', ' + pair[1]);

							var pair = _step.value;
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					var _promises = _this.onRequest(formData);

					if (_promises) {
						_promises.then(function () {
							_Repository.Repository.request(_Config.Config.backend + uri, { api: 'json' }, formData).then(function (response) {
								_this.onResponse(response);
							}).catch(function (error) {
								_this.onRequestError(error);
							});
						});
					}
				}
			});
		});
		return _this;
	}

	_createClass(FormWrapper, [{
		key: 'onRequest',
		value: function onRequest(requestData) {
			var promises = [];

			for (var i in this._onRequest) {
				var onReq = this._onRequest[i](requestData, this);

				if (onReq) {
					promises.push(onReq);
				}
			}

			if (promises.length == 0) {
				return Promise.resolve();
			}

			return Promise.all(promises);
		}
	}, {
		key: 'onRequestError',
		value: function onRequestError(error) {}
	}, {
		key: 'onResponse',
		value: function onResponse(response) {
			for (var i in this._onResponse) {
				this._onResponse[i](response, this);
			}

			if (response.messages) {
				for (var _i in response.messages) {
					_Toast.Toast.instance().alert(response.body && response.body.id ? 'Success!' : 'Error!', response.messages[_i], 3500);
				}
			}
		}
	}, {
		key: 'onLoad',
		value: function onLoad(form, model) {
			for (var i in this._onLoad) {
				this._onLoad[i](this);
			}
		}
	}, {
		key: 'customFields',
		value: function customFields() {
			return {};
		}
	}]);

	return FormWrapper;
}(_View2.View);