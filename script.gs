function btn_uid() {

  var ss = SpreadsheetApp.getActiveSheet()
  var rng = ss.getActiveRange();
  var uid = rng.getValues()[0];     //PMID



  //1 Check if uid has 1 to 8 digits
  
  var patt = /\d{1,8}/;
   
  if (!patt.test(uid)) {
    Browser.msgBox('Invalid PMID format');
    return(0);
  }
  
    
  
  //2 Get XML result from uid
    
  var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=' + uid + '&retmode=xml';
  var xml = UrlFetchApp.fetch(url).getContentText();
  var document = XmlService.parse(xml);
  var root = document.getRootElement();
  var root2 = root.getChild('PubmedArticle');
  
  
  
  //3 Check if uid is valid
  
  if (root2 == null) {
    Browser.msgBox('No PMID data');
    return(0);
  }
  
  
  
  //4 XML parsing

  var patt2 = /\d{1,2}/;
  var months_char = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

  var commonJournal = root2.getChild('MedlineCitation').getChild('Article');
  var journal = commonJournal.getChild('Journal').getChild('ISOAbbreviation').getText();          // journal
  var articleTitle = commonJournal.getChild('ArticleTitle').getText();                            // title
  
  var j_issue = commonJournal.getChild('Journal').getChild('JournalIssue');
  
  var yy = j_issue.getChild('PubDate').getChild('Year').getText();
  var mm_node = j_issue.getChild('PubDate').getChild('Month');
  var dd_node = j_issue.getChild('PubDate').getChild('Day');
  
  var j_pubdate = yy
  
  if (mm_node != null) {
    
    mm = mm_node.getText();
    
    if (patt2.test(mm)) {
        mm = months_char[Number(mm)-1];}
        
    j_pubdate = j_pubdate + " " + mm;
  }
  
  if (dd_node != null) {
    j_pubdate = j_pubdate + " " + Number(dd_node.getText());
  }
  
  var vol = j_issue.getChild('Volume').getText();
  var issue = j_issue.getChild('Issue').getText();
  var page = commonJournal.getChild('Pagination').getChild('MedlinePgn').getText();
  var page_items = j_pubdate + ";" + vol + '(' + issue + '):' + page;                           // year, month, day, volume, issue, page
  
  
  
  
  var authors = "";
  var author = commonJournal.getChild('AuthorList').getChildren('Author');
  for (i = 0; i < author.length; i++) { 
                    if (i != 0) { authors += ", "; }
                    authorName = author[i].getChild('Initials').getText() + " " + author[i].getChild('LastName').getText();
    authors += authorName;
            }                                                                                     // authors list

  
  
  //5 Fill the retrieved data
  
  var str = [[authors,articleTitle,journal,page_items]];
  var newRange = rng.offset(0, 1, 1, 4);
  newRange.setValues(str);
  
}
