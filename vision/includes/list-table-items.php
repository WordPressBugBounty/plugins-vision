<?php
defined('ABSPATH') || exit;

if(!class_exists('WP_List_Table')) {
	require_once(ABSPATH . 'wp-admin/includes/class-wp-list-table.php');
}

class Vision_List_Table_Items extends WP_List_Table {
	private $count_all = 0;
	private $count_mine = 0;
	private $count_trash = 0;
	private $url_preview_base = '';
	
	function __construct() {
		parent::__construct([
			'singular'=> 'vision_item',
			'plural' => 'vision_items',
			'ajax' => false
		]);

		$this->url_preview_base = '/vision/map/';
	}
	
	function handle_row_actions($post, $column_name, $primary) {
		return '';
	}
	
	function joinPaths() {
		$paths = [];
		
		foreach(func_get_args() as $arg) {
			if($arg !== '') {
				$paths[] = $arg;
			}
		}
		
		return preg_replace('#/+#','/',join('/', $paths));
	}
	
	function filesystem_method() {
		return 'direct';
	}
	
	function request_filesystem_credentials() {
		return true;
	}
	
	function getFileSystem() {
		global $wp_filesystem;
		$result = true;
		
		if(!$wp_filesystem) {
			require_once(ABSPATH . '/wp-admin/includes/file.php');
			
			add_filter('filesystem_method', [$this, 'filesystem_method']);
			add_filter('request_filesystem_credentials', [$this, 'request_filesystem_credentials']);
			
			$credentials = request_filesystem_credentials(site_url(), '', true, false, null);
			
			$result = WP_Filesystem($credentials);
			
			remove_filter('filesystem_method', [$this, 'filesystem_method']);
			remove_filter('request_filesystem_credentials', [$this, 'request_filesystem_credentials']);
		}
		
		if($result)
			return $wp_filesystem;
		return null;
	}
	
	function column_default($item, $column_name){
		switch($column_name){
			case 'title':
			case 'active':
			case 'shortcode':
			case 'author':
			case 'editor':
			case 'created':
			case 'modified':
			case 'id':
				return $item[$column_name];
		}
	}
	
	function column_cb($item) {
		return sprintf(
			'<input type="checkbox" name="%1$s[]" value="%2$s">',
			esc_attr($this->_args['singular']), // let's simply repurpose the table's singular label
			esc_attr($item['id']) // the value of the checkbox should be the record's ID
		);
	}
	
	function column_title($item) {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		$item_status = sanitize_key(filter_input(INPUT_GET, 'item_status', FILTER_DEFAULT));
		
		if(current_user_can('manage_options') || get_current_user_id()==$item['author']) {
			$actions = [];
			
			switch($item_status) {
				case 'trash': {
					$args = [
						'page' => $page,
						'item_status' => $item_status,
						'action' => 'restore',
						'id' => $item['id']
					];
					$url = add_query_arg($args, 'admin.php');
					
					$actions['restore'] = sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url(wp_nonce_url($url, 'restore_' . $item['id'])),
						esc_html__('Restore', 'vision')
					);
					
					$args = [
						'page' => $page,
						'item_status' => $item_status,
						'action' => 'delete',
						'id' => $item['id']
					];
					$url = add_query_arg($args, 'admin.php');
					
					$actions['delete'] = sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url(wp_nonce_url($url, 'delete_' . $item['id'])),
						esc_html__('Delete Permanently', 'vision')
					);
				} break;
				default: {
					$args = [
						'page' => 'vision_item',
						'item_status' => $item_status,
						'id' => $item['id']
					];
					$url = add_query_arg($args, 'admin.php');
					
					$actions['edit'] = sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url($url),
						esc_html__('Edit', 'vision')
					);
					
					$args = [
						'page' => $page,
						'item_status' => $item_status,
						'action' => 'copy',
						'id' => $item['id']
					];
					$url = add_query_arg($args, 'admin.php');
					
					$actions['copy'] = sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url(wp_nonce_url($url, 'copy_' . $item['id'])),
						esc_html__('Duplicate', 'vision')
					);
					
					$args = [
						'page' => $page,
						'item_status' => $item_status,
						'action' => 'trash',
						'id' => $item['id']
					];
					$url = add_query_arg($args, 'admin.php');
					
					$actions['trash'] = sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url(wp_nonce_url($url, 'trash_' . $item['id'])),
						esc_html__('Move to Trash', 'vision')
					);
					
					$args = [
						'preview' => true
					];
					$url = add_query_arg($args, $this->url_preview_base . $item['id']);
					
					$actions['view'] = sprintf(
						'<a href="%1$s" target="_blank">%2$s</a>',
						esc_url($url),
						esc_html__('Preview', 'vision')
					);
				} break;
			}
			
			return sprintf('<a href="?page=%1$s&id=%2$s" class="row-title">%3$s</a> %4$s',
                'vision_item',
				$item['id'],
				$item['title'],
				$this->row_actions($actions)
			);
		}
		
		return sprintf('<strong>%1$s</strong>', $item['title']);
	}
	
	function column_active($item) {
		if(current_user_can('manage_options') || get_current_user_id()==$item['author']) {
			return sprintf(
				'<div class="vision-toggle vision-%1$s" data-id="%2$s">&nbsp;</div>',
				($item['active'] ? 'checked' : 'unchecked'),
				$item['id']
			);
		} else {
			return sprintf(
				'<div class="vision-toggle vision-readonly vision-%1$s" data-id="%2$s">&nbsp;</div>',
				($item['active'] ? 'checked' : 'unchecked'),
				$item['id']
			);
		}
	}
	
	function column_shortcode($item) {
		return sprintf('<code>[vision id="%1$s"]</code>', $item['id']);
	}
	
	function column_author($item) {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		$args = [
			'page' => $page,
			'author' => $item['author']
		];
		$url = add_query_arg($args, 'admin.php');
		
		return sprintf(
			'<a href="%1$s">%2$s</a>',
			esc_url( $url ),
			get_the_author_meta('display_name', $item['author'])
		);
	}
	
	function column_editor($item) {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		$args = [
			'page' => $page,
			'editor' => $item['editor']
		];
		$url = add_query_arg($args, 'admin.php');
		
		return sprintf(
			'<a href="%1$s">%2$s</a>',
			esc_url( $url ),
			get_the_author_meta('display_name', $item['editor'])
		);
	}
	
	function column_created( $item ) {
		$m_time = mysql2date('Y/m/d g:i:s a', $item['created']);
		$h_time = mysql2date('Y/m/d', $item['created']);
		
		return sprintf('<abbr title="%1$s">%2$s</abbr>', esc_attr($m_time), esc_html($h_time));
	}
	
	function column_modified( $item ) {
		$m_time = mysql2date('Y/m/d g:i:s a', $item['modified']);
		$h_time = mysql2date('Y/m/d', $item['modified']);
		
		return sprintf('<abbr title="%1$s">%2$s</abbr>', esc_attr($m_time), esc_html($h_time));
	}
	
	function get_views() {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		$item_status = sanitize_key(filter_input(INPUT_GET, 'item_status', FILTER_DEFAULT));
		
		$args_all   = ['page' => $page];
		$args_mine  = ['page' => $page, 'item_status' => 'mine'];
		$args_trash = ['page' => $page, 'item_status' => 'trash'];
		
		$url_all   = add_query_arg($args_all, 'admin.php');
		$url_mine  = add_query_arg($args_mine, 'admin.php');
		$url_trash = add_query_arg($args_trash, 'admin.php');
		
		$status_links = [
			'all'   => sprintf('<a href="%1$s" %2$s>%3$s <span class="count">(%4$d)</span></a>', esc_url($url_all),   ($item_status            ? '' : 'class="current"'), esc_html__('All','vision'), $this->count_all),
			'mine'  => sprintf('<a href="%1$s" %2$s>%3$s <span class="count">(%4$d)</span></a>', esc_url($url_mine),  ($item_status == 'mine'  ? 'class="current"' : ''), esc_html__('Mine','vision'), $this->count_mine),
			'trash' => sprintf('<a href="%1$s" %2$s>%3$s <span class="count">(%4$d)</span></a>', esc_url($url_trash), ($item_status == 'trash' ? 'class="current"' : ''), esc_html__('Trash','vision'), $this->count_trash)
        ];
		
		return $status_links;
	}
	
	function get_columns() {
		$columns = [
			'cb'        => '<input type="checkbox">',
			'title'     => esc_html__('Title', 'vision'),
			'active'    => esc_html__('Active', 'vision'),
			'shortcode' => esc_html__('Shortcode', 'vision'),
			'author'    => esc_html__('Author', 'vision'),
			'editor'    => esc_html__('Editor', 'vision'),
			'created'   => esc_html__('Created', 'vision'),
			'modified'  => esc_html__('Modified', 'vision')
		];
		return $columns;
	}
	
	function get_sortable_columns() {
		$columns = [
			'title'    => ['title', false],
			'active'   => ['active', false],
			'author'   => ['author', false],
			'editor'   => ['editor', false],
			'created'  => ['created', false],
			'modified' => ['modified', false]
        ];
		return $columns;
	}
	
	function get_bulk_actions() {
		$item_status = sanitize_key(filter_input(INPUT_GET, 'item_status', FILTER_DEFAULT));
		$actions = [];
		
		switch($item_status) {
			case 'trash': {
				$actions = [
					'restore' => esc_html__('Restore', 'vision'),
					'delete'  => esc_html__('Delete Permanently', 'vision')
				];
			} break;
			default: {
				$actions = [
					'copy'  => esc_html__('Duplicate', 'vision'),
					'trash' => esc_html__('Move to Trash', 'vision')
				];
			} break;
		}
		return $actions;
	}
	
	function process_trash_action($id, $flag) {
		global $wpdb;
		$table = $wpdb->prefix . VISION_PLUGIN_NAME;
		$author = get_current_user_id();

        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE id=%d", $id);
		$item = $wpdb->get_row($sql, OBJECT);
        // phpcs:enable
		
		if($item && (current_user_can('manage_options') || $author==$item->author)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->update($table, ['deleted' => $flag], ['id' => $id]);
		}
	}
	
	function process_copy_action($id) {
		global $wpdb;
		$table = $wpdb->prefix . VISION_PLUGIN_NAME;
		$author = get_current_user_id();

        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE id=%d AND NOT deleted", $id);
		$item = $wpdb->get_row($sql, OBJECT);
        // phpcs:enable

		if($item && (current_user_can('manage_options') || $author==$item->author)) {
			$itemData = unserialize($item->data);
			$itemData->slug = sanitize_title(($itemData->slug ? $itemData->slug : $itemData->title));
			$itemData->title = esc_html__('[Duplicate] ', 'vision') . $itemData->title;
			$itemConfig = unserialize($item->config);

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$result = $wpdb->insert(
				$table,
				[
					'title' => $itemData->title,
					'slug' => $itemData->slug,
					'active' => $itemData->active,
					'data' => serialize($itemData),
					'config' => serialize($itemConfig),
					'author' => $author,
					'editor' => $author,
					'created' => current_time('mysql', 1),
					'modified' => current_time('mysql', 1)
				]
			);

			// [filemanager] create an external file
			if($result) {
				if(wp_is_writable(VISION_PLUGIN_UPLOAD_DIR)) {
					$dir_src_root = $this->joinPaths(VISION_PLUGIN_UPLOAD_DIR, $id);
					$dir_dst_root = $this->joinPaths(VISION_PLUGIN_UPLOAD_DIR, $wpdb->insert_id);
					$wp_filesystem = $this->getFileSystem();
					
					if($wp_filesystem) {
						if(!$wp_filesystem->is_dir($dir_dst_root)) {
							$wp_filesystem->mkdir($dir_dst_root);
						}
						copy_dir($dir_src_root, $dir_dst_root);
					}
				}
			}
		}
	}
	
	function process_delete_action($id) {
		global $wpdb;
		$table = $wpdb->prefix . VISION_PLUGIN_NAME;
		$author = get_current_user_id();

        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE id=%d AND deleted", $id);
		$item = $wpdb->get_row($sql, OBJECT);
        // phpcs:enable
		
		if($item && (current_user_can('manage_options') || $author==$item->author) ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$result = $wpdb->delete($table, ['id' => $id], ['%d']);

			// [filemanager] delete file
			if($result) {
                if (wp_is_writable(VISION_PLUGIN_UPLOAD_DIR)) {
                    $dir_root = $this->joinPaths(VISION_PLUGIN_UPLOAD_DIR, $id);
                    $wp_filesystem = $this->getFileSystem();
                    if ($wp_filesystem) {
                        if ($wp_filesystem->is_dir($dir_root)) {
                            $wp_filesystem->rmdir($dir_root, true);
                        }
                    }
                }
            }
		}
	}
	
	function process_actions() {
		switch($this->current_action()) {
			case 'trash': {
				if(isset($_POST['_wpnonce']) && !empty($_POST['_wpnonce'])) {
					$nonce = sanitize_key(filter_input(INPUT_POST, '_wpnonce', FILTER_DEFAULT));
					$nonce_key = 'bulk-' . $this->_args['plural'];
					
					if(wp_verify_nonce($nonce, $nonce_key)) {
						$items = filter_input(INPUT_POST, $this->_args['singular'], FILTER_SANITIZE_NUMBER_INT, FILTER_REQUIRE_ARRAY);
						
						foreach($items as $id) {
							$this->process_trash_action($id, true);
						}
					}
				} else if(isset($_GET['_wpnonce']) && !empty($_GET['_wpnonce'])) {
					$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
					$nonce = sanitize_key(filter_input(INPUT_GET, '_wpnonce', FILTER_DEFAULT));
					$nonce_key = 'trash_' . $id;
					
					if(wp_verify_nonce($nonce, $nonce_key)) {
						$this->process_trash_action($id, true);
					}
				}
			} break;
			case 'restore': {
				if(isset($_POST['_wpnonce']) && !empty($_POST['_wpnonce'])) {
					$nonce = sanitize_key(filter_input(INPUT_POST, '_wpnonce', FILTER_DEFAULT));
					$nonce_key = 'bulk-' . $this->_args['plural'];
					if(wp_verify_nonce($nonce, $nonce_key)) {
						$items = filter_input(INPUT_POST, $this->_args['singular'], FILTER_SANITIZE_NUMBER_INT, FILTER_REQUIRE_ARRAY);
						
						foreach($items as $id) {
							$this->process_trash_action($id, false);
						}
					}
				} else if(isset($_GET['_wpnonce']) && !empty($_GET['_wpnonce'])) {
					$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
					$nonce = sanitize_key(filter_input(INPUT_GET, '_wpnonce', FILTER_DEFAULT));
					$nonce_key = 'restore_' . $id;
					
					if(wp_verify_nonce($nonce, $nonce_key)) {
						$this->process_trash_action($id, false);
					}
				}
			} break;
			case 'copy': {
				if(isset($_POST['_wpnonce']) && !empty($_POST['_wpnonce'])) {
					$nonce = sanitize_key(filter_input(INPUT_POST, '_wpnonce', FILTER_DEFAULT));
					$nonce_key = 'bulk-' . $this->_args['plural'];
					if(wp_verify_nonce($nonce, $nonce_key)) {
						$items = filter_input(INPUT_POST, $this->_args['singular'], FILTER_SANITIZE_NUMBER_INT, FILTER_REQUIRE_ARRAY);
						
						foreach($items as $id) {
							$this->process_copy_action($id);
						}
					}
				} else if(isset($_GET['_wpnonce']) && !empty($_GET['_wpnonce'])) {
					$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
					$nonce = sanitize_key(filter_input(INPUT_GET, '_wpnonce', FILTER_DEFAULT));
					$nonce_key = 'copy_' . $id;
					
					if(wp_verify_nonce($nonce, $nonce_key)) {
						$this->process_copy_action($id);
					}
				}
			} break;
			case 'delete': {
				if(isset($_POST['_wpnonce']) && !empty($_POST['_wpnonce'])) {
					$nonce = sanitize_key(filter_input(INPUT_POST, '_wpnonce', FILTER_DEFAULT));
					$nonce_key = 'bulk-' . $this->_args['plural'];
					if(wp_verify_nonce($nonce, $nonce_key)) {
						$items = filter_input(INPUT_POST, $this->_args['singular'], FILTER_SANITIZE_NUMBER_INT, FILTER_REQUIRE_ARRAY);
						
						foreach($items as $id) {
							$this->process_delete_action($id);
						}
					}
				} else if(isset($_GET['_wpnonce']) && !empty($_GET['_wpnonce'])) {
					$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
					$nonce = sanitize_key(filter_input(INPUT_GET, '_wpnonce', FILTER_DEFAULT));
					$nonce_key = 'delete_' . $id;
					
					if(wp_verify_nonce($nonce, $nonce_key)) {
						$this->process_delete_action($id);
					}
				}
			} break;
		}
	}
	
	function prepare_items() {
		$this->process_actions();
		
		$columns = $this->get_columns();
		$sortable = $this->get_sortable_columns();
		$hidden = [];
		
		$itemsPerPage = 25;
		$currentPage = ($this->get_pagenum()-1) * $itemsPerPage;
		
		$this->_column_headers = [$columns, $hidden, $sortable];

		global $wpdb;
		$table = $wpdb->prefix . VISION_PLUGIN_NAME;

		$item_status = sanitize_key(filter_input(INPUT_GET, 'item_status', FILTER_DEFAULT));

        // phpcs:disable WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
		$orderby = (isset($_GET['orderby']) ? strtolower(sanitize_key(filter_input(INPUT_GET, 'orderby', FILTER_DEFAULT))) : 'id');
		$order   = (isset($_GET['order']) ? strtolower(sanitize_key(filter_input(INPUT_GET, 'order', FILTER_DEFAULT))) : 'desc');
		$author  = (isset($_GET['author']) ? filter_input(INPUT_GET, 'author', FILTER_SANITIZE_NUMBER_INT ) : NULL);
		$editor  = (isset($_GET['editor']) ? filter_input(INPUT_GET, 'editor', FILTER_SANITIZE_NUMBER_INT ) : NULL);
		$search  = (isset($_POST['s']) ? '%' . $wpdb->esc_like(sanitize_text_field(filter_input(INPUT_POST, 's', FILTER_DEFAULT))) . '%' : '%');
        // phpcs:enable

		$current_user = get_current_user_id();

        // check user input
        $sortable_columns = array_keys($sortable);
        $orderby = in_array($orderby, $sortable_columns) ? $orderby : 'id';

        $order_values = ['asc', 'desc'];
        $order = in_array($order, $order_values) ? $order : 'desc';

		$sql = '';
        $sql_total_items = '';
		$total_items = 0;

		// database operations
		if(current_user_can('manage_options')) { // by default, the manage_options permission is only given to 'Super Users' and 'Administrators'
            // phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$this->count_all   = $wpdb->query("SELECT id FROM {$table} WHERE NOT deleted");
			$this->count_mine  = $wpdb->query($wpdb->prepare("SELECT id FROM {$table} WHERE NOT deleted AND author=%s", $current_user));
			$this->count_trash = $wpdb->query("SELECT id FROM {$table} WHERE deleted");
            // phpcs:enable

            // phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnquotedComplexPlaceholder
			switch($item_status) {
				case 'trash': {
					if($author) {
						$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE author=%s AND deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $author, $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND deleted AND IFNULL(title,'') LIKE %s", $author, $search);
					} else if($editor) {
						$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE editor=%s AND deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $editor, $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE editor=%s AND deleted AND IFNULL(title,'') LIKE %s", $editor, $search);
					} else {
						$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE deleted AND IFNULL(title,'') LIKE %s", $search);
					}
				} break;
				case 'mine': {
					if($author) {
						$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $current_user, $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s", $current_user, $search);
					} else if($editor) {
						$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE author=%s AND editor=%s AND NOT deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $current_user, $editor, $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND editor=%s AND NOT deleted AND IFNULL(title,'') LIKE %s", $current_user, $editor, $search);
					} else {
						$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $current_user, $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s", $current_user, $search);
					}
				} break;
				default: {
					if($author) {
						$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $author, $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s", $author, $search);
					} else if($editor) {
						$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE editor=%s AND NOT deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $editor, $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE editor=%s AND NOT deleted AND IFNULL(title,'') LIKE %s", $editor, $search);
					} else {
                        $sql = $wpdb->prepare("SELECT * FROM {$table} WHERE NOT deleted AND IFNULL(title,'') LIKE %s ORDER BY %1s %1s LIMIT %d, %d", $search, $orderby, $order, $currentPage, $itemsPerPage);
						$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE NOT deleted AND IFNULL(title,'') LIKE %s", $search);
					}
				} break;
			}
            // phpcs:enable
		} else { // the current user view
            // phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$this->count_all   = $wpdb->query($wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND NOT deleted", $current_user));
			$this->count_mine  = $wpdb->query($wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND NOT deleted", $current_user));
			$this->count_trash = $wpdb->query($wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND deleted", $current_user));
            // phpcs:enable

            // phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			switch($item_status) {
				case 'trash': {
					$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE author=%s AND deleted AND IFNULL(title,'') LIKE %s ORDER BY %s %s LIMIT %d, %d", $current_user, $search, $orderby, $order, $currentPage, $itemsPerPage);
					$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND deleted AND IFNULL(title,'') LIKE %s", $current_user, $search);
				} break;
				case 'mine': {
					$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s ORDER BY %s %s LIMIT %d, %d", $current_user, $search, $orderby, $order, $currentPage, $itemsPerPage);
					$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s", $current_user, $search);
				} break;
				default: {
					$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s ORDER BY %s %s LIMIT %d, %d", $current_user, $search, $orderby, $order, $currentPage, $itemsPerPage);
					$sql_total_items = $wpdb->prepare("SELECT id FROM {$table} WHERE author=%s AND NOT deleted AND IFNULL(title,'') LIKE %s", $current_user, $search);
				} break;
			}
            // phpcs:enable
		}

        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$this->items = $wpdb->get_results($sql, 'ARRAY_A');
		$total_items = $wpdb->query($sql_total_items);
        // phpcs:enable

		$this->set_pagination_args([
			'total_items' => $total_items,
			'total_pages' => ceil($total_items / $itemsPerPage)
		]);
	}
}
?>