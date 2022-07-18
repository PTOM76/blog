var $client_lang = {
	search_result: "&#8220;$1&#8221; の検索結果",
	search_in_site: "サイト内を検索",
	posts_not_found: "投稿が見つかりませんでした。"
};
var $url = new URL(window.location.href);
var $params = url.searchParams;

function getMeta($metaProperty) {
	var $metas = document.getElementsByTagName('meta');
	for (let $j = 0; $j < $metas.length; $j++) {
		if ($metas[$j].getAttribute('property') === $metaProperty) {
			return $metas[$j].getAttribute('content');
		}
	}
}

if (params.has('s') ) {
	var $s = params.get('s');
	var $isFound = false;
	var $html = `
		<h1 id="archive-title" class="archive-title"><span class="fa fa-search" aria-hidden="true"></span>"fab"</h1>
		<form class="search-box input-box" method="get" action="/">
			<input type="text" placeholder="${$client_lang['search_in_site']}" name="s" class="search-edit" aria-label="input" value="${$s}">
			<button type="submit" class="search-submit" aria-label="button"><span class="fa fa-search" aria-hidden="true"></span></button>
		</form>
		<div id="list" class="list ect-entry-card front-page-type-index">
	`;
	document.title = $client_lang['search_result'].replace('$1', $s) + "  |  " + getMeta("og:site_name");
	
	var $categories_name;
	fetch('static-json/categories/index.json')
	.then(($response) => $response.json())
	.then(($data) => {
		$data.forEach($item => {
			$categories_name[$item['term_id']] = $item['name'];
		}
	});
	
	fetch('./wp-json/wp/v2/posts/index.json')
	.then(($response) => $response.json())
	.then(($data) => {
		$data.forEach($item => {
			if ($item.title.rendered.indexOf($s) != -1 || $item.content.rendered.indexOf($s) != -1) {
				$isFound = true;
				
				var $categories_html;
				$item.categories.forEach($id => {
					$categories_html += '<span class="entry-category">' + $categories_name[$id] + '</span>';
				});
				var $post_date = $item.date.replace('-', '.');
				$post_date = $post_date.substr(0, $post_date.indexOf('T'));
				
				$html += `
					<a href="${$item.link}" class="entry-card-wrap a-wrap border-element cf" title="${$item.title.rendered}">
						<article id="post-40" class="post-40 entry-card e-card cf post type-post status-publish format-standard hentry category-minecraft-post category-11-post tag-fabricmc-post tag-mod-post">
							<figure class="entry-card-thumb card-thumb e-card-thumb">
								<img data-src="http://localhost/wordpress/wp-content/themes/cocoon-master/images/no-image-320.png" alt="" class="no-image entry-card-thumb-image list-no-image lozad lozad-img" loading="lazy" width="320" height="180" /><noscript><img src="/wp-content/themes/cocoon-master/images/no-image-320.png" alt="" class="no-image entry-card-thumb-image list-no-image" width="320" height="180" /></noscript>            <span class="cat-label cat-label-13">Minecraft</span>    </figure><!-- /.entry-card-thumb -->
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
	});
	if (!$isFound) {
		$html += `
			<div class="posts-not-found">
				<h2>NOT FOUND</h2>
				<p>${$client_lang['posts_not_found']}</p>
			</div>
		`;
	}
	$html += `</div><!-- .list -->`;
}