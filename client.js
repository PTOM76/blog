var $client_lang = {
	search_result: "“$1” の検索結果",
	search_in_site: "サイト内を検索",
	posts_not_found: "投稿が見つかりませんでした。"
};
var $url = new URL(window.location.href);
var $params = $url.searchParams;
var $htmlSetted = false;

function apprStr($str) {
	$str = $str.toLowerCase();
	$str = $str.replace(/(<([^>]+)>)/gi, '');
	$str = $str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function ($m) {
		return String.fromCharCode($m.charCodeAt(0) - 0xFEE0);
	});
	$str = $str.replace(/[\u30a1-\u30f6]/g, function ($m) {
		return String.fromCharCode($m.charCodeAt(0) - 0x60);
	});
	return $str;
}

function getMeta($metaProperty) {
	var $metas = document.getElementsByTagName('meta');
	for (let $j = 0; $j < $metas.length; $j++) {
		if ($metas[$j].getAttribute('property') === $metaProperty) {
			return $metas[$j].getAttribute('content');
		}
	}
}
if ($params.has('s')) {
	var $s = $params.get('s');
	var $isFound = false;
	var $html = `
		<h1 id="archive-title" class="archive-title"><span class="fa fa-search" aria-hidden="true"></span>"${$s}"</h1>
		<form class="search-box input-box" method="get" action="/">
			<input type="text" placeholder="${$client_lang['search_in_site']}" name="s" class="search-edit" aria-label="input" value="${$s}">
			<button type="submit" class="search-submit" aria-label="button"><span class="fa fa-search" aria-hidden="true"></span></button>
		</form>
		<div id="list" class="list ect-entry-card front-page-type-index">
	`;
	document.title = $client_lang['search_result'].replace('$1', $s) + "  |  " + getMeta("og:site_name");
	var $categories_name = new Array();
	var $thumbs;

	var $proc2 = function() {
		fetch('./wp-json/wp/v2/pages').then(($response) => $response.json()).then(($page_data) => {
			fetch('./wp-json/wp/v2/posts').then(($response) => $response.json()).then(($post_data) => {
				$data = Object.assign($post_data, $page_data);
				if ($data !== undefined) $data.forEach($item => {
					if (apprStr($item.title.rendered).indexOf(apprStr($s)) != -1 || apprStr($item.content.rendered).indexOf(apprStr($s)) != -1) {
						$isFound = true;
						var $categories_html;
						$item.categories.forEach($id => {
							$categories_html += '<span class="entry-category">' + $categories_name[$id] + '</span>';
						});
						var $post_date = $item.date.replaceAll('-', '.');
						$post_date = $post_date.substr(0, $post_date.indexOf('T'));
						var $thumb_url = "/wp-content/themes/cocoon-master/images/no-image-320.png";
						if ($thumbs[$item.id] !== undefined) {
							$thumb_url = $thumbs[$item.id];
						}
						$html += `
					<a href="${$item.link}" class="entry-card-wrap a-wrap border-element cf" title="${$item.title.rendered}">
						<article>
							<figure class="entry-card-thumb card-thumb e-card-thumb">
								<img src="${$thumb_url}" alt="" class="no-image entry-card-thumb-image list-no-image" width="320" height="180" />						<span class="cat-label cat-label-13">Minecraft</span>		</figure><!-- /.entry-card-thumb -->
							<div class="entry-card-content card-content e-card-content">
								<h2 class="entry-card-title card-title e-card-title" itemprop="headline">${$item.title.rendered}</h2>
								<div class="entry-card-snippet card-snippet e-card-snippet">
									${$item.excerpt.rendered}
								</div>
								<div class="entry-card-meta card-meta e-card-meta">
									<div class="entry-card-info e-card-info">
										<span class="post-date"><span class="fa fa-clock-o" aria-hidden="true"></span> ${$post_date}</span>
									</div>
									<div class="entry-card-categorys">${$categories_html}</div>
								</div>
							</div><!-- /.entry-card-content -->
						</article>
					</a>
				`;
					}
				});
				if ($isFound === false) {
					$html += `
				<div class="posts-not-found">
					<h2>NOT FOUND</h2>
					<p>${$client_lang['posts_not_found']}</p>
				</div>
			`;
				}
				$html += `</div><!-- .list -->`;
				document.addEventListener("DOMContentLoaded", function () {
					if ($htmlSetted === false) {
						document.getElementById("main").innerHTML = $html;
						$htmlSetted = true;
					}
				});
				window.addEventListener("load", function () {
					if ($htmlSetted === false) {
						document.getElementById("main").innerHTML = $html;
						$htmlSetted = true;
					}
				});
			});
		});

	}

	fetch('./static-json/categories') // 
		.then(($response) => $response.json()).then(($data) => {
			if ($data !== undefined) Object.keys($data).forEach($key => {
				var $item = $data[$key];
				$categories_name[$item.term_id] = $item.name;
			});
			fetch('./static-json/thumbs') // 
			.then(($response) => $response.json()).then(($data) => {
				$thumbs = $data;
				$proc2();
			});
		});
}